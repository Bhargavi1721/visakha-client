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
      console.log('[FollowUp] useEffect triggered with:', {
        isCreatedByUser,
        isLatestMessage,
        parentMessageId,
        messageId
      });

      // Only show suggestions for AI responses (not user messages) and only for the latest message
      if (isCreatedByUser || !isLatestMessage) {
        console.log('[FollowUp] Skipping - not AI response or not latest message');
        return;
      }

      // Get the user's question by finding the parent message
      const messages = getMessages();
      console.log('[FollowUp] Got messages:', messages?.length || 0, 'messages');
      
      if (!messages || !parentMessageId) {
        console.log('[FollowUp] No messages or parentMessageId available');
        return;
      }

      const userQuestion = messages.find((msg) => msg.messageId === parentMessageId);
      console.log('[FollowUp] Found user question:', userQuestion?.text || 'Not found');
      
      if (!userQuestion || !userQuestion.text) {
        console.log('[FollowUp] No user question text found');
        return;
      }

      const questionText = userQuestion.text;
      console.log('[FollowUp] Calling generateAISuggestions with:', questionText);
      
      // Generate AI-powered suggestions
      generateAISuggestions(questionText);
    }, [isLatestMessage, isCreatedByUser, parentMessageId, getMessages]);

    const generateAISuggestions = async (userQuestion: string) => {
      setIsLoading(true);
      
      try {
        console.log('[FollowUp] Generating AI suggestions for:', userQuestion);
        console.log('[FollowUp] Making API call to /api/tools/ai-suggestions');
        
        // Call our backend API endpoint instead of Groq directly
        const response = await fetch('/api/tools/test-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            userQuestion: userQuestion,
          }),
        });

        console.log('[FollowUp] API Response status:', response.status);
        console.log('[FollowUp] API Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error('[FollowUp] API Error:', response.status, errorData);
          
          // If the API returns fallback suggestions, use them
          if (errorData.suggestions && Array.isArray(errorData.suggestions)) {
            console.log('[FollowUp] Using fallback suggestions from API error response');
            setSuggestions(errorData.suggestions);
            return;
          }
          
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[FollowUp] API Response data:', data);
        
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          console.log('[FollowUp] AI-generated suggestions:', data.suggestions);
          setSuggestions(data.suggestions);
        } else {
          // Fallback to generic suggestions if no suggestions returned
          console.warn('[FollowUp] No suggestions returned from API, using fallback');
          useFallbackSuggestions(userQuestion);
        }
      } catch (error) {
        console.error('[FollowUp] Error generating AI suggestions:', error);
        console.error('[FollowUp] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
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