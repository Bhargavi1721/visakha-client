# Autocomplete Architecture & Implementation

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Window                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   document.body                        │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │         React Portal Dropdown                    │ │ │
│  │  │  (position: fixed, z-index: 9999)               │ │ │
│  │  │                                                  │ │ │
│  │  │  ┌────────────────────────────────────────────┐ │ │ │
│  │  │  │ Header: "5 suggestions • Use ↑↓..."       │ │ │ │
│  │  │  ├────────────────────────────────────────────┤ │ │ │
│  │  │  │ ✓ What is Vi-Sakha and how does it work? │ │ │ │
│  │  │  │   How can I integrate Vi-Sakha...         │ │ │ │
│  │  │  │   What are the key features...            │ │ │ │
│  │  │  │   How do I set up Vi-Sakha...             │ │ │ │
│  │  │  │   Can you explain the architecture...     │ │ │ │
│  │  │  └────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌────────────────────────────────────────────────┐   │ │
│  │  │         ChatForm Component                     │   │ │
│  │  │  ┌──────────────────────────────────────────┐ │   │ │
│  │  │  │  TextArea (Input Field)                  │ │   │ │
│  │  │  │  "What"                                   │ │   │ │
│  │  │  └──────────────────────────────────────────┘ │   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Component Hierarchy

```
ChatForm.tsx
  └─ QuestionAutocomplete.tsx
       ├─ Portal → document.body
       │    └─ Dropdown Container (fixed positioning)
       │         ├─ Header (instructions)
       │         └─ AutoSizer + List (react-virtualized)
       │              └─ AutocompleteItem (repeated)
       │                   └─ Highlighted text
       └─ Event Listeners
            ├─ Input (debounced)
            ├─ Keyboard (TAB, Enter, Arrows, Escape)
            ├─ Click Outside
            ├─ Scroll (update position)
            └─ Resize (update position)
```

## 📊 Data Flow

```
User Types "What"
      ↓
Input Event Fired
      ↓
Debounce Timer (300ms)
      ↓
setSearchValue("What")
      ↓
filteredSuggestions (useMemo)
      ↓
Filter & Sort Questions
      ↓
setOpen(true)
      ↓
updatePosition() (useCallback)
      ↓
getBoundingClientRect()
      ↓
Calculate { top, left, width }
      ↓
setPosition({ top, left, width })
      ↓
Render Portal with Fixed Position
      ↓
Dropdown Appears Above Input
```

## 🎯 Key Implementation Details

### 1. Portal Rendering

**Why Portal?**
- Escapes parent container constraints
- Avoids CSS positioning issues
- Ensures proper z-index layering
- Allows fixed positioning relative to viewport

**Code:**
```typescript
return createPortal(
  <div className="fixed z-[9999]" style={{ top, left, width }}>
    {/* Dropdown content */}
  </div>,
  document.body
);
```

### 2. Position Calculation

**How it works:**
```typescript
const updatePosition = useCallback(() => {
  const rect = textAreaRef.current.getBoundingClientRect();
  const dropdownHeight = Math.min(filteredSuggestions.length, MAX_VISIBLE_ROWS) * ROW_HEIGHT + 50;
  
  setPosition({
    top: rect.top - dropdownHeight - 8,  // Above textarea with 8px gap
    left: rect.left,                      // Align left edge
    width: rect.width,                    // Match textarea width
  });
}, [textAreaRef, filteredSuggestions.length]);
```

**Coordinates:**
- `rect.top`: Distance from viewport top to textarea top
- `rect.left`: Distance from viewport left to textarea left
- `rect.width`: Width of textarea
- `dropdownHeight`: Calculated based on number of suggestions

### 3. Event Handling

**Input Event (Debounced):**
```typescript
const handleInput = (e: Event) => {
  clearTimeout(debounceTimerRef.current);
  
  debounceTimerRef.current = setTimeout(() => {
    const value = target.value.trim();
    if (value.length > 0) {
      setSearchValue(value);
      setOpen(true);
    }
  }, 300);
};
```

**Keyboard Events:**
```typescript
switch (e.key) {
  case 'Tab':
    e.preventDefault();  // Prevent default tab behavior
    handleSelect(filteredSuggestions[activeIndex]);
    break;
  case 'ArrowDown':
    e.preventDefault();
    setActiveIndex((prev) => (prev + 1) % length);
    break;
  // ... other keys
}
```

**Position Updates:**
```typescript
useEffect(() => {
  if (!open) return;
  
  updatePosition();
  
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
  
  return () => {
    window.removeEventListener('scroll', updatePosition, true);
    window.removeEventListener('resize', updatePosition);
  };
}, [open, updatePosition]);
```

### 4. Filtering Logic

**Case-insensitive matching with prioritization:**
```typescript
const filteredSuggestions = useMemo(() => {
  const lowerSearch = searchValue.toLowerCase();
  
  return SAKHA_QUESTIONS
    .map((question, idx) => ({
      id: `suggestion-${idx}`,
      text: question,
      matchScore: question.toLowerCase().includes(lowerSearch) ? 1 : 0,
    }))
    .filter((option) => option.matchScore > 0)
    .sort((a, b) => {
      // Prioritize matches at the beginning
      const aStartsWith = a.text.toLowerCase().startsWith(lowerSearch);
      const bStartsWith = b.text.toLowerCase().startsWith(lowerSearch);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });
}, [searchValue]);
```

### 5. Selection Handling

**When user selects a suggestion:**
```typescript
const handleSelect = useCallback((suggestion) => {
  // Update form state
  methods.setValue('text', suggestion.text, { shouldValidate: true });
  
  // Update textarea directly
  textAreaRef.current.value = suggestion.text;
  
  // Move cursor to end
  textAreaRef.current.setSelectionRange(length, length);
  
  // Close dropdown
  setOpen(false);
  setSearchValue('');
  setActiveIndex(0);
  
  // Return focus
  textAreaRef.current.focus();
}, [textAreaRef, methods]);
```

## 🎨 Styling Strategy

**Tailwind Classes Used:**
- `fixed`: Fixed positioning relative to viewport
- `z-[9999]`: Very high z-index for layering
- `rounded-2xl`: Rounded corners
- `shadow-xl`: Large shadow for depth
- `bg-surface-tertiary`: Theme-aware background
- `dark:bg-gray-800`: Dark mode support

**Dynamic Styles:**
```typescript
style={{
  top: `${position.top}px`,
  left: `${position.left}px`,
  width: `${position.width}px`,
  pointerEvents: 'auto',
}}
```

## 🔧 Performance Optimizations

1. **Memoization:**
   - `useMemo` for filtered suggestions
   - `useCallback` for event handlers
   - `memo` for AutocompleteItem component

2. **Virtualization:**
   - `react-virtualized` for large lists
   - Only renders visible rows
   - Smooth scrolling with overscan

3. **Debouncing:**
   - 300ms delay on input
   - Prevents excessive filtering
   - Reduces re-renders

4. **Event Listener Cleanup:**
   - All listeners properly removed
   - Prevents memory leaks
   - Conditional attachment

## 🧪 Testing Checklist

- [ ] Dropdown appears above input
- [ ] TAB key inserts suggestion
- [ ] Arrow keys navigate
- [ ] Enter selects suggestion
- [ ] Escape closes dropdown
- [ ] Mouse click selects
- [ ] Click outside closes
- [ ] Scroll updates position
- [ ] Resize updates position
- [ ] Debounce works (300ms)
- [ ] First item highlighted
- [ ] Matching text highlighted
- [ ] Dark mode works
- [ ] Empty input hides dropdown
- [ ] No suggestions hides dropdown

## 📚 Dependencies

- **react**: Core React library
- **react-dom**: For `createPortal`
- **react-virtualized**: For efficient list rendering
- **react-hook-form**: For form state management
- **tailwindcss**: For styling

## 🚀 Future Enhancements

1. **API Integration:**
   - Replace static questions with API calls
   - Fetch suggestions based on user history
   - Personalized recommendations

2. **Advanced Features:**
   - Fuzzy matching algorithm
   - Recent searches
   - Popular questions
   - Category grouping
   - Keyboard shortcuts (Ctrl+Space to open)

3. **Accessibility:**
   - ARIA labels
   - Screen reader support
   - Focus management
   - Keyboard-only navigation

4. **Performance:**
   - Caching suggestions
   - Lazy loading
   - Request cancellation
   - Optimistic updates
