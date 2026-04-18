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
  'Can I preview the certificate template for non-NPTEL batches?',
  'What is the Website link of Vinternship?',
  'Can we opt for an on-campus/offline internship?',
  'Is attendance tracked in this internship?',
  'Do I need to use a specific name or email for the internship?',
  'Will the course instructor supervise our work directly?',
  'Do we get to meet our mentors?',
  'Where should I check first for updates, instructions, or clarifications?',
  'Where do I raise my concern initially?',
  'What if I don\'t receive a response in 24 hours?',
  'If my concern still isn\'t addressed, how do I escalate further?',
  'Why is it important to follow the deadlines mentioned in tasks and milestones?',
  'What happens if I miss a deadline?',
  'Where can we find the Live session recordings?',
  'What are the program completion criteria?',
  'Where can I find information on certification?',
  'Will recommendation letters be provided?',
  'When will AKSians (NPTEL) cohort receive their offer letter?',
  'When will AKSians (NPTEL) cohort receive their certificate of completion?',
  'What is the expected pace of learning?',
  'What happens if I don\'t maintain regular progress?',
  'Can I appeal a discontinuation decision?',
  'Can I rejoin the program after discontinuation?',
  'How do I withdraw from the internship?',
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
  'Where can I find activity deadlines (ViBe / Case Study)?',
  'When are Discord breakout rooms opened and who can join?',
  'How will I know when the breakout rooms are active?',
  'What is the purpose of the breakout rooms?',
  'Why is my dashboard not updated yet?',
  'My submission is missing in the dashboard. What should I do?',
  'Dashboard is not loading at the moment. What should I do?',
  'How to check my status on Dashboard?',
  'Where can I find the application form?',
  'Should we do the projects as a group or as an individual?',
  'How can we connect with the mentors?',
  'Is the project phase necessary for the completion of the Internship?',
];

/**
 * QuestionAutocomplete Component
 * Provides inline ghost text suggestions (like GitHub Copilot)
 * Press TAB to accept the suggestion
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

  // Find matching suggestion based on current input
  const findSuggestion = useCallback((inputValue: string) => {
    if (!inputValue.trim()) {
      return '';
    }

    const lowerInput = inputValue.toLowerCase();
    const match = SAKHA_QUESTIONS.find((q) => q.toLowerCase().startsWith(lowerInput));

    if (match) {
      // Return only the remaining part of the suggestion
      return match.slice(inputValue.length);
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
      className="pointer-events-none absolute inset-0 z-50"
      style={{
        padding: '13px 20px',
        fontSize: '14px',
        fontFamily: 'inherit',
        lineHeight: '1.5',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      {/* Container for text alignment */}
      <div style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
        {/* Invisible current text to push ghost text to correct position */}
        <span 
          style={{ 
            color: 'transparent',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {currentText}
        </span>
        {/* Visible ghost text */}
        <span
          style={{
            color: '#9ca3af',
            opacity: 0.7,
            userSelect: 'none',
            pointerEvents: 'none',
            fontWeight: 'normal',
          }}
        >
          {suggestion}
        </span>
      </div>
    </div>
  );
}

export default QuestionAutocomplete;
