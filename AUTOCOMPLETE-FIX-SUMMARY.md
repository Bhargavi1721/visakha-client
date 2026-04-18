# Autocomplete Dropdown Visibility Fix

## Problem
The autocomplete dropdown was not visible when using `absolute` positioning within the parent container hierarchy. The component was working correctly (confirmed by debug panel), but the dropdown appeared only at the top of the screen with `fixed` positioning, not above the input field.

## Root Cause
CSS positioning issue - `absolute` positioning doesn't work properly when the parent containers have complex layouts, transforms, or overflow properties that create new stacking contexts.

## Solution Implemented
Used **React Portal** with **Fixed Positioning** to render the dropdown outside the normal DOM hierarchy:

### Key Changes:

1. **Portal Rendering** (`createPortal`)
   - Renders dropdown at `document.body` level
   - Bypasses parent container positioning constraints
   - Ensures dropdown is always visible and properly layered

2. **Dynamic Position Calculation**
   - Uses `getBoundingClientRect()` to get textarea coordinates
   - Calculates dropdown position relative to viewport
   - Updates position on scroll and resize events

3. **Fixed Positioning**
   - Uses `position: fixed` with calculated coordinates
   - Z-index set to 9999 for proper layering
   - Width matches textarea width exactly

### Code Structure:

```typescript
// Calculate position based on textarea
const updatePosition = useCallback(() => {
  const rect = textAreaRef.current.getBoundingClientRect();
  const dropdownHeight = Math.min(filteredSuggestions.length, MAX_VISIBLE_ROWS) * ROW_HEIGHT + 50;
  
  setPosition({
    top: rect.top - dropdownHeight - 8, // 8px gap above textarea
    left: rect.left,
    width: rect.width,
  });
}, [textAreaRef, filteredSuggestions.length]);

// Render using portal
return createPortal(
  <div className="fixed z-[9999]" style={{ top, left, width }}>
    {/* Dropdown content */}
  </div>,
  document.body
);
```

### Event Listeners:
- **Scroll**: Updates position when page scrolls
- **Resize**: Updates position when window resizes
- **Input**: Triggers filtering with 300ms debounce
- **Keyboard**: TAB, Enter, Arrow keys, Escape

## Testing Steps

1. **Start the project**:
   ```bash
   cd sakha-project
   npm run frontend:dev
   ```

2. **Test the autocomplete**:
   - Type in the chat input (e.g., "What is")
   - Dropdown should appear **above** the input field
   - Should show filtered suggestions
   - First suggestion should be highlighted

3. **Test TAB key** (most important):
   - Type "What"
   - Press TAB key
   - Should insert the highlighted suggestion
   - Should close the dropdown

4. **Test keyboard navigation**:
   - Arrow Down/Up: Navigate through suggestions
   - Enter: Select highlighted suggestion
   - Escape: Close dropdown

5. **Test mouse interaction**:
   - Click on any suggestion
   - Should insert the clicked suggestion

6. **Test positioning**:
   - Scroll the page while dropdown is open
   - Dropdown should follow the textarea
   - Resize window - dropdown should adjust

## Files Modified

1. **QuestionAutocomplete.tsx**
   - Added `createPortal` from 'react-dom'
   - Implemented `updatePosition` callback
   - Added scroll/resize event listeners
   - Changed rendering to use portal with fixed positioning
   - Removed unused imports (recoil, store)

2. **ChatForm.tsx**
   - Updated component comment
   - Removed unused `index` prop from QuestionAutocomplete

## Expected Behavior

✅ Dropdown appears above the input field
✅ Dropdown follows textarea on scroll/resize
✅ TAB key inserts highlighted suggestion
✅ Keyboard navigation works (↑↓, Enter, Escape)
✅ Mouse click selects suggestion
✅ Debounce prevents excessive filtering (300ms)
✅ First suggestion auto-highlighted
✅ Matching text highlighted in suggestions

## Build Time
- Docker build: ~7-10 minutes
- Frontend dev server: ~30-60 seconds

## Next Steps
1. Test the dropdown visibility
2. Verify TAB key completion works
3. Test all keyboard shortcuts
4. Test on different screen sizes
5. Test scrolling behavior

## Troubleshooting

If dropdown still not visible:
1. Check browser console for errors
2. Verify `textAreaRef.current` is not null
3. Check if `getBoundingClientRect()` returns valid coordinates
4. Inspect element to see if portal is rendering at body level
5. Check z-index conflicts with other elements

If TAB key doesn't work:
1. Verify `e.preventDefault()` is called in keydown handler
2. Check if dropdown is open (`open === true`)
3. Verify `filteredSuggestions` has items
4. Check console logs for keyboard events
