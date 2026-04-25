/**
 * Bug Condition Exploration Test for FollowUpSuggestions
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation.
 * 
 * GOAL: Surface counterexamples that demonstrate the bug exists:
 * - React error #310 (too many re-renders)
 * - Form state doesn't match textarea value after clicking suggestion
 * - Send button may be disabled after clicking suggestion
 * - React error #300 (hook ordering) when message switches between latest/non-latest
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import FollowUpSuggestions from './FollowUpSuggestions';
import { ChatFormProvider } from '~/Providers/ChatFormContext';
import { useForm } from 'react-hook-form';
import type { ChatFormValues } from '~/common';

// Mock console.error to capture React errors
const originalError = console.error;
let consoleErrors: string[] = [];

beforeAll(() => {
  console.error = jest.fn((...args) => {
    const errorMessage = args.join(' ');
    consoleErrors.push(errorMessage);
    // Still call original for debugging if needed
    // originalError(...args);
  });
});

afterAll(() => {
  console.error = originalError;
});

beforeEach(() => {
  consoleErrors = [];
  jest.clearAllMocks();
});

// Wrapper component that provides form context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<ChatFormValues>({
    defaultValues: {
      text: '',
    },
  });

  return (
    <RecoilRoot>
      <ChatFormProvider {...methods}>{children}</ChatFormProvider>
    </RecoilRoot>
  );
};

describe('FollowUpSuggestions - Bug Condition Exploration', () => {
  /**
   * Test 1: Verify no React error #310 (too many re-renders)
   * 
   * EXPECTED ON UNFIXED CODE: This test will FAIL because the component
   * uses unstable useCallback dependencies (setText from Recoil) causing
   * infinite re-render loops.
   */
  it('should render without React error #310 (too many re-renders)', async () => {
    // Arrange
    const messageId = 'test-message-1';
    const isLatestMessage = true;
    const isCreatedByUser = false;

    // Act - render the component
    render(
      <TestWrapper>
        <FollowUpSuggestions
          messageId={messageId}
          isLatestMessage={isLatestMessage}
          isCreatedByUser={isCreatedByUser}
        />
      </TestWrapper>,
    );

    // Assert - no React error #310 should be in console
    await waitFor(() => {
      const hasError310 = consoleErrors.some(
        (error) =>
          error.includes('Minified React error #310') ||
          error.includes('Too many re-renders') ||
          error.includes('Maximum update depth exceeded'),
      );

      expect(hasError310).toBe(false);
    });

    // Verify suggestions are displayed
    expect(screen.getByText('Can you explain this in more detail?')).toBeInTheDocument();
  });

  /**
   * Test 2: Verify form state synchronization after clicking suggestion
   * 
   * EXPECTED ON UNFIXED CODE: This test will FAIL because the component
   * uses direct DOM manipulation (textarea.value = suggestion) instead of
   * React Hook Form's setValue, causing form state to be out of sync.
   */
  it('should update React Hook Form state correctly when clicking a suggestion', async () => {
    // Arrange
    const user = userEvent.setup();
    const messageId = 'test-message-2';
    const isLatestMessage = true;
    const isCreatedByUser = false;
    const suggestionText = 'Can you explain this in more detail?';

    let formMethods: ReturnType<typeof useForm<ChatFormValues>>;

    const TestWrapperWithRef = ({ children }: { children: React.ReactNode }) => {
      formMethods = useForm<ChatFormValues>({
        defaultValues: {
          text: '',
        },
      });

      return (
        <RecoilRoot>
          <ChatFormProvider {...formMethods}>
            {children}
            <textarea id="prompt-textarea" />
          </ChatFormProvider>
        </RecoilRoot>
      );
    };

    // Act - render and click suggestion
    render(
      <TestWrapperWithRef>
        <FollowUpSuggestions
          messageId={messageId}
          isLatestMessage={isLatestMessage}
          isCreatedByUser={isCreatedByUser}
        />
      </TestWrapperWithRef>,
    );

    const suggestionButton = screen.getByText(suggestionText);
    await user.click(suggestionButton);

    // Assert - form state should match the suggestion text
    await waitFor(() => {
      const formValue = formMethods!.getValues('text');
      expect(formValue).toBe(suggestionText);
    });

    // Also verify textarea value matches (for completeness)
    const textarea = document.getElementById('prompt-textarea') as HTMLTextAreaElement;
    expect(textarea?.value).toBe(suggestionText);
  });

  /**
   * Test 3: Verify no React error #300 (hook ordering) when toggling message states
   * 
   * EXPECTED ON UNFIXED CODE: This test will FAIL because the component
   * has a conditional return BEFORE hooks (useCallback), violating React's
   * Rules of Hooks and causing hook count to change between renders.
   */
  it('should maintain stable hook ordering when toggling between latest/non-latest states', async () => {
    // Arrange
    const messageId = 'test-message-3';

    // Act - render with isLatestMessage=true, then re-render with isLatestMessage=false
    const { rerender } = render(
      <TestWrapper>
        <FollowUpSuggestions
          messageId={messageId}
          isLatestMessage={true}
          isCreatedByUser={false}
        />
      </TestWrapper>,
    );

    // Verify initial render shows suggestions
    expect(screen.getByText('Can you explain this in more detail?')).toBeInTheDocument();

    // Clear console errors from initial render
    consoleErrors = [];

    // Re-render with isLatestMessage=false (should hide suggestions)
    rerender(
      <TestWrapper>
        <FollowUpSuggestions
          messageId={messageId}
          isLatestMessage={false}
          isCreatedByUser={false}
        />
      </TestWrapper>,
    );

    // Assert - no React error #300 should be in console
    await waitFor(() => {
      const hasError300 = consoleErrors.some(
        (error) =>
          error.includes('Minified React error #300') ||
          error.includes('rendered more hooks than during the previous render') ||
          error.includes('Rendered fewer hooks than expected'),
      );

      expect(hasError300).toBe(false);
    });

    // Verify suggestions are hidden
    expect(screen.queryByText('Can you explain this in more detail?')).not.toBeInTheDocument();
  });

  /**
   * Test 4: Verify send button remains enabled after clicking suggestion
   * 
   * EXPECTED ON UNFIXED CODE: This test may FAIL if form state synchronization
   * issues cause the send button to be disabled after clicking a suggestion.
   */
  it('should keep form in valid state after clicking suggestion', async () => {
    // Arrange
    const user = userEvent.setup();
    const messageId = 'test-message-4';
    const isLatestMessage = true;
    const isCreatedByUser = false;
    const suggestionText = 'What are some examples?';

    let formMethods: ReturnType<typeof useForm<ChatFormValues>>;

    const TestWrapperWithRef = ({ children }: { children: React.ReactNode }) => {
      formMethods = useForm<ChatFormValues>({
        defaultValues: {
          text: '',
        },
      });

      return (
        <RecoilRoot>
          <ChatFormProvider {...formMethods}>
            {children}
            <textarea id="prompt-textarea" />
          </ChatFormProvider>
        </RecoilRoot>
      );
    };

    // Act - render and click suggestion
    render(
      <TestWrapperWithRef>
        <FollowUpSuggestions
          messageId={messageId}
          isLatestMessage={isLatestMessage}
          isCreatedByUser={isCreatedByUser}
        />
      </TestWrapperWithRef>,
    );

    const suggestionButton = screen.getByText(suggestionText);
    await user.click(suggestionButton);

    // Assert - form should be valid (has text value)
    await waitFor(() => {
      const formValue = formMethods!.getValues('text');
      expect(formValue).toBeTruthy();
      expect(formValue.length).toBeGreaterThan(0);
      
      // Form should be in a valid state (not dirty, but has value)
      const formState = formMethods!.formState;
      expect(formState.isValid).toBe(true);
    });
  });

  /**
   * Test 5: Verify cursor positioning after clicking suggestion
   * 
   * This test verifies that the cursor is positioned at the end of the text
   * after clicking a suggestion. This behavior should be preserved.
   */
  it('should position cursor at end of text after clicking suggestion', async () => {
    // Arrange
    const user = userEvent.setup();
    const messageId = 'test-message-5';
    const isLatestMessage = true;
    const isCreatedByUser = false;
    const suggestionText = 'How does this work in practice?';

    const TestWrapperWithTextarea = ({ children }: { children: React.ReactNode }) => {
      const methods = useForm<ChatFormValues>({
        defaultValues: {
          text: '',
        },
      });

      return (
        <RecoilRoot>
          <ChatFormProvider {...methods}>
            {children}
            <textarea id="prompt-textarea" data-testid="prompt-textarea" />
          </ChatFormProvider>
        </RecoilRoot>
      );
    };

    // Act - render and click suggestion
    render(
      <TestWrapperWithTextarea>
        <FollowUpSuggestions
          messageId={messageId}
          isLatestMessage={isLatestMessage}
          isCreatedByUser={isCreatedByUser}
        />
      </TestWrapperWithTextarea>,
    );

    const suggestionButton = screen.getByText(suggestionText);
    await user.click(suggestionButton);

    // Assert - cursor should be at the end of the text
    await waitFor(() => {
      const textarea = screen.getByTestId('prompt-textarea') as HTMLTextAreaElement;
      expect(textarea.selectionStart).toBe(suggestionText.length);
      expect(textarea.selectionEnd).toBe(suggestionText.length);
    });
  });
});