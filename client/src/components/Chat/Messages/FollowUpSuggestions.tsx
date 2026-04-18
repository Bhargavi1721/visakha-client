import { memo, useCallback, useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '~/utils';
import { useChatContext } from '~/Providers';
import { useSubmitMessage } from '~/hooks';

interface FollowUpSuggestionsProps {
  messageId?: string;
  isLatestMessage: boolean;
  isCreatedByUser: boolean;
  messageText?: string;
  parentMessageId?: string | null;
  conversation?: any;
}

const FollowUpSuggestions = memo(
  ({ messageId, isLatestMessage, isCreatedByUser, parentMessageId }: FollowUpSuggestionsProps) => {
    const { getMessages } = useChatContext();
    const { submitMessage } = useSubmitMessage();
    
    const [suggestions, setSuggestions] = useState<string[]>([
      'Can you explain this in more detail?',
      'What are some examples?',
      'How does this work in practice?',
    ]);
    const [isLoading, setIsLoading] = useState(false);

    // Generate AI-powered contextual suggestions based on the USER'S question
    useEffect(() => {
      // Only show suggestions for AI responses (not user messages) and only for the latest message
      if (isCreatedByUser || !isLatestMessage) {
        return;
      }

      // Get the user's question by finding the parent message
      const messages = getMessages();
      if (!messages || !parentMessageId) {
        return;
      }

      const userQuestion = messages.find((msg) => msg.messageId === parentMessageId);
      if (!userQuestion || !userQuestion.text) {
        return;
      }

      const questionText = userQuestion.text;
      
      // Generate AI-powered suggestions
      generateAISuggestions(questionText);
    }, [isLatestMessage, isCreatedByUser, parentMessageId, getMessages]);

    const generateAISuggestions = async (userQuestion: string) => {
      setIsLoading(true);
      
      try {
        // Call Groq API to generate contextual follow-up questions
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || ''}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are a helpful assistant that generates relevant follow-up questions for Vicharanashala's Vinternship program.
                
Given a user's question about Vicharanashala/Vinternship, generate exactly 3 relevant follow-up questions that:
1. Are directly related to the user's original question topic
2. Help the user explore the topic deeper or related aspects
3. Are specific to Vicharanashala topics: ViBe platform, case studies, endorsements, health points, projects, policies, support, certificates, etc.
4. Are concise (under 15 words each)
5. Are natural and conversational

Return ONLY the 3 questions, one per line, without numbering or bullet points.`
              },
              {
                role: 'user',
                content: `User asked: "${userQuestion}"\n\nGenerate 3 relevant follow-up questions:`
              }
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate suggestions');
        }

        const data = await response.json();
        const generatedText = data.choices[0]?.message?.content || '';
        
        // Parse the response - split by newlines and filter empty lines
        const generatedSuggestions = generatedText
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && !line.match(/^\d+[\.\)]/)) // Remove numbering if present
          .slice(0, 3); // Take only first 3

        if (generatedSuggestions.length > 0) {
          console.log('AI-generated suggestions:', generatedSuggestions);
          setSuggestions(generatedSuggestions);
        } else {
          // Fallback to generic suggestions if parsing fails
          console.warn('Failed to parse AI suggestions, using fallback');
          useFallbackSuggestions(userQuestion);
        }
      } catch (error) {
        console.error('Error generating AI suggestions:', error);
        // Use fallback keyword-based suggestions on error
        useFallbackSuggestions(userQuestion);
      } finally {
        setIsLoading(false);
      }
    };

    const useFallbackSuggestions = (questionText: string) => {
      // Generic fallback suggestions if AI generation fails
      const fallbackSuggestions = [
        'Can you explain this in more detail?',
        'What should I do if I face issues?',
        'Where can I find more information?',
      ];

      setSuggestions(fallbackSuggestions);
    };

    // Handle suggestion click - automatically submit the question
    const handleSuggestionClick = useCallback(
      (suggestion: string) => {
        console.log('Submitting suggestion:', suggestion);
        // Automatically submit the suggestion as a new message
        submitMessage({ text: suggestion });
      },
      [submitMessage],
    );
    
    // Conditional return AFTER hooks to maintain stable hook ordering
    if (isCreatedByUser || !isLatestMessage) {
      return null;
    }

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Sparkles className={cn('h-3.5 w-3.5', isLoading && 'animate-pulse')} />
          <span className="font-medium">
            {isLoading ? 'Generating suggestions...' : 'Follow-up:'}
          </span>
        </div>
        {!isLoading && suggestions.map((suggestion: string, index: number) => (
          <button
            key={`suggestion-${messageId || 'unknown'}-${index}`}
            onClick={() => handleSuggestionClick(suggestion)}
            className={cn(
              'group relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
              'border-border-medium bg-surface-primary text-text-primary',
              'hover:border-border-heavy hover:bg-surface-secondary hover:shadow-sm',
              'focus:outline-none focus:ring-2 focus:ring-border-xheavy focus:ring-offset-1',
              'active:scale-95',
            )}
            type="button"
            aria-label={`Ask: ${suggestion}`}
          >
            <span className="relative">{suggestion}</span>
            <div
              className={cn(
                'absolute inset-0 rounded-full opacity-0 transition-opacity duration-200',
                'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
                'group-hover:opacity-100',
              )}
            />
          </button>
        ))}
      </div>
    );
  },
);

FollowUpSuggestions.displayName = 'FollowUpSuggestions';

export default FollowUpSuggestions;
