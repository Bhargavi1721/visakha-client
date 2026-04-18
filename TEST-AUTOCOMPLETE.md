# Quick Test Guide for Autocomplete Feature

## ✅ What Was Fixed

The autocomplete dropdown now uses **React Portal** with **fixed positioning** to render outside the normal DOM hierarchy. This ensures the dropdown is always visible above the input field, regardless of parent container constraints.

## 🚀 How to Test

### 1. Start the Development Server

```bash
cd sakha-project
docker-compose up
```

Wait for the build to complete (~7-10 minutes first time, faster on subsequent runs).

Access the app at: **http://localhost:3080**

### 2. Test Basic Functionality

1. **Open the chat input** (the main text area at the bottom)
2. **Type "What"** and wait 300ms
3. **Expected**: Dropdown appears **above** the input field with filtered suggestions
4. **Expected**: First suggestion is highlighted (darker background)

### 3. Test TAB Key (MOST IMPORTANT)

1. Type "How do"
2. Wait for dropdown to appear
3. **Press TAB key**
4. **Expected**: 
   - Highlighted suggestion is inserted into input
   - Dropdown closes
   - Cursor moves to end of text
   - Focus stays in input field

### 4. Test Keyboard Navigation

1. Type "What"
2. **Press Arrow Down** → Next suggestion highlights
3. **Press Arrow Up** → Previous suggestion highlights
4. **Press Enter** → Selected suggestion is inserted
5. **Press Escape** → Dropdown closes

### 5. Test Mouse Interaction

1. Type "Can"
2. **Click on any suggestion**
3. **Expected**: Clicked suggestion is inserted

### 6. Test Filtering

1. Type "Vi-Sakha" → Should show all questions containing "Vi-Sakha"
2. Type "integrate" → Should show integration-related questions
3. Type "xyz123" → Should show no suggestions (dropdown hidden)

### 7. Test Positioning (Advanced)

1. Type "What" to open dropdown
2. **Scroll the page** → Dropdown should follow the input
3. **Resize browser window** → Dropdown should adjust width
4. **Expected**: Dropdown always stays above input field

### 8. Test Edge Cases

1. **Empty input** → No dropdown
2. **Clear input** → Dropdown closes
3. **Click outside** → Dropdown closes
4. **Type very fast** → Debounce prevents excessive updates (300ms)

## 🎯 Success Criteria

✅ Dropdown appears above input field (not at top of screen)
✅ TAB key inserts highlighted suggestion
✅ Keyboard navigation works smoothly
✅ Mouse clicks work
✅ Dropdown follows input on scroll/resize
✅ First suggestion auto-highlighted
✅ Matching text highlighted in yellow
✅ Dropdown closes on selection/escape/click outside

## 🐛 If Something Doesn't Work

### Dropdown Not Visible
1. Open browser DevTools (F12)
2. Check Console for errors
3. Look for `[Autocomplete]` log messages
4. Inspect element - look for a `<div class="fixed z-[9999]">` at body level

### TAB Key Not Working
1. Check if dropdown is open (should see it visually)
2. Check Console for keyboard event logs
3. Verify suggestions are filtered (type "What" should show results)

### Dropdown in Wrong Position
1. Check if textarea has valid `getBoundingClientRect()` values
2. Verify scroll/resize listeners are attached
3. Check for CSS conflicts with z-index

## 📝 Console Logs to Look For

When typing, you should see:
```
[Autocomplete] Monitoring textarea: prompt-textarea
[Autocomplete] Input event: What
[Autocomplete] After debounce, value: What
```

## 🔧 Technical Details

- **Portal**: Renders at `document.body` level
- **Positioning**: `position: fixed` with calculated coordinates
- **Z-index**: 9999 (very high to ensure visibility)
- **Debounce**: 300ms delay on input
- **Max visible rows**: 5 (scrollable if more)
- **Row height**: 48px
- **Gap above input**: 8px

## 📞 Need Help?

If the dropdown still doesn't appear:
1. Check if React Portal is supported (should be in all modern browsers)
2. Verify `document.body` is accessible
3. Check for JavaScript errors in Console
4. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. Clear browser cache and reload
