/**
 * Context Analyzer Utility
 * Provides context-aware analysis for LibreChat conversations
 */

export interface ConversationContext {
  mainTopic: string;
  subtopics: string[];
  userIntent: 'learning' | 'troubleshooting' | 'information' | 'guidance';
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Message {
  text?: string;
  isCreatedByUser: boolean;
  messageId?: string;
}

/**
 * Analyzes conversation context to determine topic, intent, and priority
 */
export class ContextAnalyzer {
  private static readonly TOPIC_KEYWORDS = {
    platform_usage: ['vibe', 'video', 'login', 'mobile', 'tablet', 'stuck', 'loading', 'dashboard'],
    case_studies: ['case study', 'case studies', 'submit', 'submission', 'mandatory'],
    ejection_policy: ['eject', 'ejection', 'discontinu', 'backward', 'inactivity', 'avoid'],
    endorsement_system: ['endorse', 'endorsement', 'jedi', 'health points', 'hp', 'network'],
    certification: ['certificate', 'completion', 'criteria', 'recommendation', 'offer letter'],
    projects: ['project', 'mentor', 'group', 'individual', 'application', 'form'],
    support_and_help: ['help', 'support', 'concern', 'escalate', 'response', 'clarification'],
    program_overview: ['internship', 'duration', 'mode', 'timing', 'session', 'about']
  };

  private static readonly INTENT_KEYWORDS = {
    learning: ['learn', 'understand', 'explain', 'what is', 'how does', 'tell me'],
    troubleshooting: ['problem', 'issue', 'error', 'not working', 'stuck', 'fix', 'solve'],
    information: ['where', 'when', 'who', 'find', 'access', 'get', 'receive'],
    guidance: ['should', 'how to', 'steps', 'process', 'guide', 'help me']
  };

  /**
   * Analyzes recent messages to extract conversation context
   */
  static analyzeContext(messages: Message[], currentQuery?: string): ConversationContext {
    const recentMessages = messages.slice(-5); // Analyze last 5 messages
    const allText = [
      ...recentMessages.map(msg => msg.text || ''),
      currentQuery || ''
    ].join(' ').toLowerCase();

    // Determine main topic category
    const category = this.determineCategory(allText);
    
    // Extract main topic and subtopics
    const { mainTopic, subtopics } = this.extractTopics(allText, category);
    
    // Determine user intent
    const userIntent = this.determineIntent(allText);
    
    // Calculate priority based on context
    const priority = this.calculatePriority(recentMessages, currentQuery);

    return {
      mainTopic,
      subtopics,
      userIntent,
      category,
      priority
    };
  }

  /**
   * Determines the main category based on keyword frequency
   */
  private static determineCategory(text: string): string {
    let maxScore = 0;
    let bestCategory = 'program_overview';

    Object.entries(this.TOPIC_KEYWORDS).forEach(([category, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        return acc + matches;
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestCategory = category;
      }
    });

    return bestCategory;
  }

  /**
   * Extracts main topic and subtopics from text
   */
  private static extractTopics(text: string, category: string): { mainTopic: string; subtopics: string[] } {
    const categoryKeywords = this.TOPIC_KEYWORDS[category as keyof typeof this.TOPIC_KEYWORDS] || [];
    
    const foundTopics = categoryKeywords.filter(keyword => 
      text.includes(keyword)
    );

    return {
      mainTopic: foundTopics[0] || category.replace('_', ' '),
      subtopics: foundTopics.slice(1, 4) // Up to 3 subtopics
    };
  }

  /**
   * Determines user intent based on question patterns
   */
  private static determineIntent(text: string): ConversationContext['userIntent'] {
    let maxScore = 0;
    let bestIntent: ConversationContext['userIntent'] = 'information';

    Object.entries(this.INTENT_KEYWORDS).forEach(([intent, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent as ConversationContext['userIntent'];
      }
    });

    return bestIntent;
  }

  /**
   * Calculates priority based on conversation flow and urgency indicators
   */
  private static calculatePriority(messages: Message[], currentQuery?: string): ConversationContext['priority'] {
    const urgencyKeywords = ['urgent', 'asap', 'immediately', 'stuck', 'error', 'problem', 'not working'];
    const allText = [
      ...messages.map(msg => msg.text || ''),
      currentQuery || ''
    ].join(' ').toLowerCase();

    // High priority if urgency keywords found
    if (urgencyKeywords.some(keyword => allText.includes(keyword))) {
      return 'high';
    }

    // Medium priority if it's a follow-up question
    if (messages.length > 1) {
      return 'medium';
    }

    // Default to low priority
    return 'low';
  }

  /**
   * Generates context-aware suggestions based on analysis
   */
  static generateContextualSuggestions(context: ConversationContext, currentQuery: string): string[] {
    const { category, userIntent, mainTopic } = context;
    
    // This would typically call your AI service with enhanced context
    // For now, return category-specific suggestions
    const suggestions: Record<string, string[]> = {
      platform_usage: [
        'How do I troubleshoot video playback issues?',
        'What browsers are supported for ViBe?',
        'How do I reset my ViBe password?'
      ],
      case_studies: [
        'What is the deadline for case study submission?',
        'How are case studies evaluated?',
        'Can I resubmit a case study?'
      ],
      ejection_policy: [
        'How can I check my activity status?',
        'What happens after ejection?',
        'How do I appeal an ejection decision?'
      ],
      // Add more categories as needed
    };

    return suggestions[category] || [
      'Can you explain this in more detail?',
      'What should I do next?',
      'Where can I find more information?'
    ];
  }
}