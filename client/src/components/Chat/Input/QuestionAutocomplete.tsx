import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatFormContext } from '~/Providers';

// Vinternship FAQ questions
const SAKHA_QUESTIONS = [
  'What is this internship about?',
  'Is this internship time-bound or duration-based?',
  'What is the mode of this internship?',
  'Are there fixed timings for live sessions?',
  'Where can I find the Internship ID?',
  'How do I log in to ViBe?',
  'Invite accepted but shows "No course enrolled"?',
  'Why are videos stuck or repeating?',
  'Can I use a mobile or tablet?',
  'I\'m experiencing video issues (stuck, looping, skipping) on ViBe. How do I troubleshoot?',
  'What are Case Studies?',
  'Are Case Studies mandatory?',
  'How do I get started with Case Studies?',
  'What comes after Case Studies?',
  'How do I submit the case studies?',
  'What is the Ejection Policy?',
  'Why does the program have an Ejection Policy?',
  'What are the types of ejection in this program?',
  'What does "Backward Eject" mean?',
  'How is inactivity measured for Backward Ejection?',
  'Can I avoid being ejected from the program?',
  'What is the Self-Healing Endorsement Network?',
  'Who are the Jedi and what role do they play?',
  'Is endorsement mandatory to complete the internship?',
  'How many endorsements can I receive or give?',
  'When am I allowed to endorse someone?',
  'How do I access my Individual Health Points (HP) page?',
  'Where should I check first for updates, instructions, or clarifications?',
  'Where do I raise my concern initially?',
  'What if I don\'t receive a response in 24 hours?',
  'If my concern still isn\'t addressed, how do I escalate further?',
  'What are the program completion criteria?',
  'Where can I find information on certification?',
  'Will recommendation letters be provided?',
  'When will AKSians (NPTEL) cohort receive their offer letter?',
  'When will AKSians (NPTEL) cohort receive their certificate of completion?',
  'Should we do the projects as a group or as an individual?',
  'How can we connect with the mentors?',
  'Is the project phase necessary for the completion of the Internship?',
  'Where can I find the application form?',
];

/**
 * QuestionAutocomplete Component
 * Provides inline ghost text suggestions (like GitHub Copilot)
 * 
 * Features:
 * - FAQ-based suggestions matching user input
 * - Smart word-based completion for partial inputs
 * - Press TAB to accept the suggestion
 */
function QuestionAutocomplete({
  textAreaRef,
}: {
  textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
}) {
  const methods = useChatFormContext();
  const [suggestion, setSuggestion] = useState('');
  const [currentText, setCurrentText] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simple suggestion finder based on FAQ matching
  const findSuggestion = useCallback((inputValue: string) => {
    if (!inputValue.trim()) {
      return '';
    }

    const lowerInput = inputValue.toLowerCase();

    // Priority 1: Exact prefix match
    const exactMatch = SAKHA_QUESTIONS.find((q) => q.toLowerCase().startsWith(lowerInput));
    if (exactMatch) {
      console.log('[Autocomplete] Exact match:', exactMatch);
      return exactMatch.slice(inputValue.length);
    }

    // Priority 2: Smart partial word matching
    if (inputValue.length >= 2) {
      const wordMatch = SAKHA_QUESTIONS.find((q) => {
        const words = q.toLowerCase().split(' ');
        return words.some(word => word.startsWith(lowerInput));
      });
      
      if (wordMatch) {
        console.log('[Autocomplete] Word-based match:', wordMatch);
        return wordMatch;
      }
    }

    return '';
  }, []);

  // Monitor textarea input and show ghost text
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (!textarea) {
      console.log('[Autocomplete] No textarea ref');
      return;
    }

    console.log('[Autocomplete] Component mounted and monitoring textarea');

    const handleInput = () => {
      const value = textarea.value;
      setCurrentText(value);

      console.log('[Autocomplete] Input detected:', value);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce for 300ms
      debounceTimerRef.current = setTimeout(() => {
        const ghostText = findSuggestion(value);
        console.log('[Autocomplete] Suggestion:', ghostText);
        setSuggestion(ghostText);
      }, 300);
    };

    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('input', handleInput);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [textAreaRef, findSuggestion]);

  // Handle TAB key to accept suggestion
  useEffect(() => {
    const textarea = textAreaRef.current;
    if (!textarea) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && suggestion) {
        console.log('[Autocomplete] TAB pressed, accepting suggestion');
        e.preventDefault();
        
        const currentValue = textarea.value;
        const newValue = currentValue + suggestion;

        // Update form value
        methods.setValue('text', newValue, { shouldValidate: true });

        // Update textarea directly
        textarea.value = newValue;

        // Move cursor to end
        textarea.setSelectionRange(newValue.length, newValue.length);

        // Clear suggestion
        setSuggestion('');
        setCurrentText(newValue);

        // Trigger input event for other listeners
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [textAreaRef, suggestion, methods]);

  // Don't render if no suggestion
  if (!suggestion) {
    console.log('[Autocomplete] No suggestion to render');
    return null;
  }

  console.log('[Autocomplete] Rendering ghost text:', { 
    currentText: `"${currentText}"`, 
    suggestion: `"${suggestion}"`,
    hasTextarea: !!textAreaRef.current 
  });

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '12px', // Match textarea padding-top
          left: '16px', // Match textarea padding-left
          right: '16px', // Match textarea padding-right
          bottom: '12px', // Match textarea padding-bottom
          fontSize: '14px',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        {/* Invisible text to measure exact cursor position */}
        <span 
          style={{ 
            visibility: 'hidden',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            whiteSpace: 'inherit',
            wordBreak: 'inherit',
            margin: 0,
            padding: 0,
            border: 0,
          }}
        >
          {currentText}
        </span>
        {/* Ghost text appears immediately after invisible text */}
        <span
          style={{
            color: '#6b7280',
            opacity: 0.7,
            fontSize: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            whiteSpace: 'inherit',
            wordBreak: 'inherit',
            margin: 0,
            padding: 0,
            border: 0,
          }}
        >
          {suggestion}
        </span>
      </div>
    </div>
  );
}

export default QuestionAutocomplete;
