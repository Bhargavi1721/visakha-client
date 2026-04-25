const { nanoid } = require('nanoid');
const { EnvVar } = require('@librechat/agents');
const { logger } = require('@librechat/data-schemas');
const { checkAccess, loadWebSearchAuth } = require('@librechat/api');
const {
  Tools,
  AuthType,
  Permissions,
  ToolCallTypes,
  PermissionTypes,
} = require('librechat-data-provider');
const { processFileURL, uploadImageBuffer } = require('~/server/services/Files/process');
const { processCodeOutput } = require('~/server/services/Files/Code/process');
const { createToolCall, getToolCallsByConvo } = require('~/models/ToolCall');
const { loadAuthValues } = require('~/server/services/Tools/credentials');
const { loadTools } = require('~/app/clients/tools/util');
const { getRoleByName } = require('~/models/Role');
const { getMessage } = require('~/models/Message');

const fieldsMap = {
  [Tools.execute_code]: [EnvVar.CODE_API_KEY],
};

const toolAccessPermType = {
  [Tools.execute_code]: PermissionTypes.RUN_CODE,
};

/**
 * Verifies web search authentication, ensuring each category has at least
 * one fully authenticated service.
 *
 * @param {ServerRequest} req - The request object
 * @param {ServerResponse} res - The response object
 * @returns {Promise<void>} A promise that resolves when the function has completed
 */
const verifyWebSearchAuth = async (req, res) => {
  try {
    const appConfig = req.config;
    const userId = req.user.id;
    /** @type {TCustomConfig['webSearch']} */
    const webSearchConfig = appConfig?.webSearch || {};
    const result = await loadWebSearchAuth({
      userId,
      loadAuthValues,
      webSearchConfig,
      throwError: false,
    });

    return res.status(200).json({
      authenticated: result.authenticated,
      authTypes: result.authTypes,
    });
  } catch (error) {
    console.error('Error in verifyWebSearchAuth:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @param {ServerRequest} req - The request object, containing information about the HTTP request.
 * @param {ServerResponse} res - The response object, used to send back the desired HTTP response.
 * @returns {Promise<void>} A promise that resolves when the function has completed.
 */
const verifyToolAuth = async (req, res) => {
  try {
    const { toolId } = req.params;
    if (toolId === Tools.web_search) {
      return await verifyWebSearchAuth(req, res);
    }
    const authFields = fieldsMap[toolId];
    if (!authFields) {
      res.status(404).json({ message: 'Tool not found' });
      return;
    }
    let result;
    try {
      result = await loadAuthValues({
        userId: req.user.id,
        authFields,
        throwError: false,
      });
    } catch (error) {
      logger.error('Error loading auth values', error);
      res.status(200).json({ authenticated: false, message: AuthType.USER_PROVIDED });
      return;
    }
    let isUserProvided = false;
    for (const field of authFields) {
      if (!result[field]) {
        res.status(200).json({ authenticated: false, message: AuthType.USER_PROVIDED });
        return;
      }
      if (!isUserProvided && process.env[field] !== result[field]) {
        isUserProvided = true;
      }
    }
    res.status(200).json({
      authenticated: true,
      message: isUserProvided ? AuthType.USER_PROVIDED : AuthType.SYSTEM_DEFINED,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @param {ServerRequest} req - The request object, containing information about the HTTP request.
 * @param {ServerResponse} res - The response object, used to send back the desired HTTP response.
 * @param {NextFunction} next - The next middleware function to call.
 * @returns {Promise<void>} A promise that resolves when the function has completed.
 */
const callTool = async (req, res) => {
  try {
    const appConfig = req.config;
    const { toolId = '' } = req.params;
    if (!fieldsMap[toolId]) {
      logger.warn(`[${toolId}/call] User ${req.user.id} attempted call to invalid tool`);
      res.status(404).json({ message: 'Tool not found' });
      return;
    }

    const { partIndex, blockIndex, messageId, conversationId, ...args } = req.body;
    if (!messageId) {
      logger.warn(`[${toolId}/call] User ${req.user.id} attempted call without message ID`);
      res.status(400).json({ message: 'Message ID required' });
      return;
    }

    const message = await getMessage({ user: req.user.id, messageId });
    if (!message) {
      logger.debug(`[${toolId}/call] User ${req.user.id} attempted call with invalid message ID`);
      res.status(404).json({ message: 'Message not found' });
      return;
    }
    logger.debug(`[${toolId}/call] User: ${req.user.id}`);
    let hasAccess = true;
    if (toolAccessPermType[toolId]) {
      hasAccess = await checkAccess({
        user: req.user,
        permissionType: toolAccessPermType[toolId],
        permissions: [Permissions.USE],
        getRoleByName,
      });
    }
    if (!hasAccess) {
      logger.warn(
        `[${toolAccessPermType[toolId]}] Forbidden: Insufficient permissions for User ${req.user.id}: ${Permissions.USE}`,
      );
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    const { loadedTools } = await loadTools({
      user: req.user.id,
      tools: [toolId],
      functions: true,
      options: {
        req,
        returnMetadata: true,
        processFileURL,
        uploadImageBuffer,
      },
      webSearch: appConfig.webSearch,
      fileStrategy: appConfig.fileStrategy,
      imageOutputType: appConfig.imageOutputType,
    });

    const tool = loadedTools[0];
    const toolCallId = `${req.user.id}_${nanoid()}`;
    const result = await tool.invoke({
      args,
      name: toolId,
      id: toolCallId,
      type: ToolCallTypes.TOOL_CALL,
    });

    const { content, artifact } = result;
    const toolCallData = {
      toolId,
      messageId,
      partIndex,
      blockIndex,
      conversationId,
      result: content,
      user: req.user.id,
    };

    if (!artifact || !artifact.files || toolId !== Tools.execute_code) {
      createToolCall(toolCallData).catch((error) => {
        logger.error(`Error creating tool call: ${error.message}`);
      });
      return res.status(200).json({
        result: content,
      });
    }

    const artifactPromises = [];
    for (const file of artifact.files) {
      const { id, name } = file;
      artifactPromises.push(
        (async () => {
          const fileMetadata = await processCodeOutput({
            req,
            id,
            name,
            apiKey: tool.apiKey,
            messageId,
            toolCallId,
            conversationId,
            session_id: artifact.session_id,
          });

          if (!fileMetadata) {
            return null;
          }

          return fileMetadata;
        })().catch((error) => {
          logger.error('Error processing code output:', error);
          return null;
        }),
      );
    }
    const attachments = await Promise.all(artifactPromises);
    toolCallData.attachments = attachments;
    createToolCall(toolCallData).catch((error) => {
      logger.error(`Error creating tool call: ${error.message}`);
    });
    res.status(200).json({
      result: content,
      attachments,
    });
  } catch (error) {
    logger.error('Error calling tool', error);
    res.status(500).json({ message: 'Error calling tool' });
  }
};

const getToolCalls = async (req, res) => {
  try {
    const { conversationId } = req.query;
    const toolCalls = await getToolCallsByConvo(conversationId, req.user.id);
    res.status(200).json(toolCalls);
  } catch (error) {
    logger.error('Error getting tool calls', error);
    res.status(500).json({ message: 'Error getting tool calls' });
  }
};

/**
 * Generate AI-powered follow-up suggestions using Groq API with highest probability ranking
 * @param {ServerRequest} req - The request object
 * @param {ServerResponse} res - The response object
 * @returns {Promise<void>} A promise that resolves when the function has completed
 */
const generateAISuggestions = async (req, res) => {
  try {
    logger.debug('[AI Suggestions] Request received from user:', req.user?.id || 'unknown');
    logger.debug('[AI Suggestions] Request body:', req.body);
    
    const { userQuestion, aiResponse } = req.body;
    
    if (!userQuestion || typeof userQuestion !== 'string') {
      logger.warn('[AI Suggestions] Invalid user question:', userQuestion);
      return res.status(400).json({ 
        error: 'User question is required'
      });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      logger.error('[AI Suggestions] GROQ_API_KEY not configured - AI suggestions unavailable');
      return res.status(500).json({
        error: 'AI service unavailable - API key not configured'
      });
    }

    logger.debug(`[AI Suggestions] Generating for question: ${userQuestion}`);

    // Enhanced prompt for highest probability suggestions
    const systemPrompt = `You are an expert AI assistant that generates the most likely and valuable follow-up questions based on conversation context.

TASK: Analyze the user's question and AI response to generate exactly 3 follow-up questions that users are MOST LIKELY to ask next.

RANKING CRITERIA (highest probability first):
1. Direct clarification questions about unclear points in the AI response
2. Questions about practical implementation or next steps
3. Questions about related topics mentioned but not fully explained
4. Questions about specific examples or use cases
5. Questions about potential problems or limitations

CONTEXT: Vicharanashala's Vinternship program including ViBe platform, case studies, endorsements, health points, projects, policies, support, certificates.

REQUIREMENTS:
- Each question must be under 12 words
- Questions should feel natural and conversational
- Rank by highest probability of being asked
- Focus on what users typically want to know next
- Avoid generic questions

Return ONLY the 3 questions, one per line, in order of highest to lowest probability.`;

    const userPrompt = aiResponse 
      ? `User asked: "${userQuestion}"\n\nAI responded: "${aiResponse.substring(0, 500)}..."\n\nGenerate 3 most likely follow-up questions:`
      : `User asked: "${userQuestion}"\n\nGenerate 3 most likely follow-up questions:`;

    // Call Groq API with enhanced parameters for better probability ranking
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent, probable suggestions
        max_tokens: 150,
        top_p: 0.9, // Focus on highest probability tokens
        frequency_penalty: 0.2, // Reduce repetition
        presence_penalty: 0.1, // Encourage diverse topics
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[AI Suggestions] Groq API Error: ${response.status} - ${errorText}`);
      return res.status(500).json({
        error: `AI service error: ${response.status}`
      });
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';
    
    // Parse and validate the response
    const generatedSuggestions = generatedText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^\d+[\.\)]/)) // Remove numbering if present
      .filter((line) => line.length <= 80 && line.includes('?')) // Ensure they're questions under 80 chars
      .slice(0, 3); // Take only first 3

    if (generatedSuggestions.length >= 3) {
      logger.debug(`[AI Suggestions] Generated high-probability suggestions: ${generatedSuggestions.join(', ')}`);
      return res.status(200).json({
        suggestions: generatedSuggestions,
        source: 'ai-generated'
      });
    } else if (generatedSuggestions.length > 0) {
      // If we got some but not enough, pad with generic but contextual ones
      const contextualFallbacks = [
        'Can you provide more specific examples?',
        'What are the key steps to get started?',
        'How does this compare to other options?'
      ];
      
      const finalSuggestions = [
        ...generatedSuggestions,
        ...contextualFallbacks.slice(0, 3 - generatedSuggestions.length)
      ];
      
      logger.debug(`[AI Suggestions] Partial AI generation, padded with contextual fallbacks: ${finalSuggestions.join(', ')}`);
      return res.status(200).json({
        suggestions: finalSuggestions,
        source: 'ai-partial'
      });
    } else {
      // If AI generation completely failed, return error instead of fallbacks
      logger.error('[AI Suggestions] AI generation failed - no valid suggestions generated');
      return res.status(500).json({
        error: 'Failed to generate AI suggestions'
      });
    }
  } catch (error) {
    logger.error('[AI Suggestions] Error generating suggestions:', error);
    return res.status(500).json({
      error: 'AI suggestion service temporarily unavailable'
    });
  }
};

module.exports = {
  callTool,
  getToolCalls,
  verifyToolAuth,
  generateAISuggestions,
};
