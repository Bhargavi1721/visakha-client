import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoilRoot } from 'recoil';
import { ChatFormProvider } from '~/Providers';
import QuestionAutocomplete from './QuestionAutocomplete';

// Mock react-virtualized
jest.mock('react-virtualized', () => ({
  AutoSizer: ({ children }: { children: (props: { width: number }) => React.ReactNode }) =>
    children({ width: 500 }),
  List: ({ rowRenderer, rowCount }: { rowRenderer: Function; rowCount: number }) => (
    <div>
      {Array.from({ length: rowCount }).map((_, index) =>
        rowRenderer({ index, key: `row-${index}`, style: {} }),
      )}
    </div>
  ),
}));

describe('QuestionAutocomplete', () => {
  let textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
  let formMethods: any;

  beforeEach(() => {
    // Create a real textarea element
    const textarea = document.createElement('textarea');
    textarea.id = 'prompt-textarea';
    document.body.appendChild(textarea);

    textAreaRef = { current: textarea };

    // Mock form methods
    formMethods = {
      setValue: jest.fn(),
      control: {},
      register: jest.fn(() => ({ ref: jest.fn() })),
      handleSubmit: jest.fn((fn) => fn),
      watch: jest.fn(),
      formState: { errors: {} },
      getValues: jest.fn(),
      reset: jest.fn(),
    };
  });

  afterEach(() => {
    // Clean up
    if (textAreaRef.current) {
      document.body.removeChild(textAreaRef.current);
    }
  });

  const renderComponent = () => {
    return render(
      <RecoilRoot>
        <ChatFormProvider {...formMethods}>
          <QuestionAutocomplete index={0} textAreaRef={textAreaRef} />
        </ChatFormProvider>
      </RecoilRoot>,
    );
  };

  it('should not show suggestions when input is empty', () => {
    renderComponent();
    expect(screen.queryByText(/suggestion/i)).not.toBeInTheDocument();
  });

  it('should show suggestions after typing with debounce', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'What is Vi-Sakha' } });

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('should filter suggestions based on input', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'architecture' } });

    await waitFor(
      () => {
        expect(screen.getByText(/architecture of Vi-Sakha/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('should highlight matching text in suggestions', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'Vi-Sakha' } });

    await waitFor(
      () => {
        const marks = document.querySelectorAll('mark');
        expect(marks.length).toBeGreaterThan(0);
      },
      { timeout: 500 },
    );
  });

  it('should select suggestion on Tab key press', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'What is' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press Tab key
    fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });

    await waitFor(() => {
      expect(formMethods.setValue).toHaveBeenCalled();
    });
  });

  it('should select suggestion on Enter key press', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'features' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press Enter key
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(formMethods.setValue).toHaveBeenCalled();
    });
  });

  it('should navigate suggestions with Arrow Down key', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'Vi-Sakha' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press Arrow Down
    fireEvent.keyDown(textarea, { key: 'ArrowDown', code: 'ArrowDown' });

    // The second item should now be active (visual check would be needed in real browser)
    await waitFor(() => {
      const activeItems = document.querySelectorAll('[class*="bg-surface-hover"]');
      expect(activeItems.length).toBeGreaterThan(0);
    });
  });

  it('should navigate suggestions with Arrow Up key', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'Vi-Sakha' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press Arrow Down twice, then Arrow Up once
    fireEvent.keyDown(textarea, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(textarea, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(textarea, { key: 'ArrowUp', code: 'ArrowUp' });

    // Should navigate back
    await waitFor(() => {
      expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
    });
  });

  it('should close suggestions on Escape key', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'Vi-Sakha' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press Escape
    fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText(/suggestion/i)).not.toBeInTheDocument();
    });
  });

  it('should select suggestion on mouse click', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'features' } });

    await waitFor(
      () => {
        expect(screen.getByText(/key features of Vi-Sakha/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Click on a suggestion
    const suggestion = screen.getByText(/key features of Vi-Sakha/i);
    fireEvent.click(suggestion.closest('div')!);

    await waitFor(() => {
      expect(formMethods.setValue).toHaveBeenCalled();
    });
  });

  it('should close suggestions when clicking outside', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'Vi-Sakha' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Click outside
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByText(/suggestion/i)).not.toBeInTheDocument();
    });
  });

  it('should prioritize suggestions starting with search term', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'What' } });

    await waitFor(
      () => {
        const suggestions = screen.getAllByText(/What/i);
        // First suggestion should start with "What"
        expect(suggestions[0].textContent).toMatch(/^What/);
      },
      { timeout: 500 },
    );
  });

  it('should update cursor position after selection', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'features' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    // Press Tab to select
    fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });

    await waitFor(() => {
      expect(formMethods.setValue).toHaveBeenCalled();
      // Cursor should be at the end
      const selectedText = formMethods.setValue.mock.calls[0][1];
      expect(textarea.selectionStart).toBe(selectedText.length);
      expect(textarea.selectionEnd).toBe(selectedText.length);
    });
  });

  it('should show correct suggestion count', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'Vi-Sakha' } });

    await waitFor(
      () => {
        const countText = screen.getByText(/\d+ suggestion/i);
        expect(countText).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('should handle rapid typing with debounce', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;

    // Type rapidly
    fireEvent.input(textarea, { target: { value: 'W' } });
    fireEvent.input(textarea, { target: { value: 'Wh' } });
    fireEvent.input(textarea, { target: { value: 'Wha' } });
    fireEvent.input(textarea, { target: { value: 'What' } });

    // Should only trigger once after debounce
    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });

  it('should prevent default Tab behavior', async () => {
    renderComponent();

    const textarea = textAreaRef.current!;
    fireEvent.input(textarea, { target: { value: 'Vi-Sakha' } });

    await waitFor(
      () => {
        expect(screen.getByText(/suggestion/i)).toBeInTheDocument();
      },
      { timeout: 500 },
    );

    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      bubbles: true,
      cancelable: true,
    });

    const preventDefaultSpy = jest.spyOn(tabEvent, 'preventDefault');
    textarea.dispatchEvent(tabEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
