# 🔧 Autocomplete Troubleshooting Guide

## ✅ Your Application is Running

**URL**: http://localhost:3080

---

## 🧪 How to Test the Autocomplete

### Step 1: Open the Application
1. Open your browser
2. Go to: **http://localhost:3080**
3. Sign in (or create an account if needed)

### Step 2: Open Browser Console (Important!)
**Press F12** to open Developer Tools and check the Console tab

You should see debug messages like:
```
[Autocomplete] Monitoring textarea: prompt-textarea
[Autocomplete] Input event: What is
[Autocomplete] After debounce, value: What is
```

### Step 3: Test Typing
1. Click in the chat input box
2. Type: **"What is"**
3. Wait **300ms** (about half a second)
4. Look for the dropdown above the input

### Step 4: Check Console for Errors
If suggestions don't appear, check the console for:
- Red error messages
- Missing component warnings
- JavaScript errors

---

## 🐛 Common Issues & Solutions

### Issue 1: No Suggestions Appearing

**Possible Causes:**
1. Debounce hasn't completed (wait 300ms)
2. Component not rendering
3. CSS z-index issue
4. JavaScript error

**Solutions:**

#### A. Check Browser Console
```
Press F12 → Console tab
Look for:
- [Autocomplete] messages
- Any red errors
```

#### B. Hard Refresh
```
Press: Ctrl + Shift + R
(This clears cache and reloads)
```

#### C. Check if Component is in DOM
```
Press F12 → Elements tab
Search for: "QuestionAutocomplete"
or search for: "suggestion"
```

#### D. Verify Textarea ID
```
In Console, type:
document.getElementById('prompt-textarea')

Should return: <textarea id="prompt-textarea"...>
```

---

### Issue 2: Dropdown Appears But Is Hidden

**Possible Cause:** Z-index or positioning issue

**Solution:**

#### Check Element Styles
```
1. Press F12
2. Click Elements tab
3. Find the autocomplete dropdown
4. Check computed styles:
   - z-index should be 50
   - position should be absolute
   - bottom should be "full"
```

#### Force Visibility (Temporary Test)
```
In Console, type:
document.querySelector('[class*="autocomplete"]').style.zIndex = '9999'
```

---

### Issue 3: Console Shows "Textarea ref not available"

**Possible Cause:** Component mounting before textarea

**Solution:**
- This is normal on first load
- Should resolve after textarea mounts
- If persists, refresh the page

---

### Issue 4: Suggestions Appear But Tab Doesn't Work

**Possible Cause:** Keyboard event not captured

**Solution:**

#### Test in Console
```
1. Type in input to show suggestions
2. In Console, type:
   document.getElementById('prompt-textarea').addEventListener('keydown', (e) => {
     console.log('Key pressed:', e.key);
   });
3. Press Tab
4. Should see: "Key pressed: Tab"
```

---

## 🔍 Debug Checklist

Run through this checklist:

### ✅ Basic Checks
- [ ] Application is running (http://localhost:3080 loads)
- [ ] You're signed in
- [ ] Chat input box is visible
- [ ] Browser console is open (F12)

### ✅ Component Checks
- [ ] No red errors in console
- [ ] See "[Autocomplete] Monitoring textarea" message
- [ ] Textarea has id="prompt-textarea"
- [ ] Component is in DOM (search Elements tab)

### ✅ Functionality Checks
- [ ] Typing triggers input events (check console)
- [ ] Debounce completes after 300ms
- [ ] Suggestions filter correctly
- [ ] Dropdown is visible (not hidden by CSS)

---

## 🧰 Manual Testing Commands

### Test 1: Check if Component Loaded
```javascript
// In Browser Console
console.log('Textarea:', document.getElementById('prompt-textarea'));
console.log('Autocomplete container:', document.querySelector('[class*="absolute"][class*="bottom-full"]'));
```

### Test 2: Manually Trigger Input Event
```javascript
// In Browser Console
const textarea = document.getElementById('prompt-textarea');
textarea.value = 'What is Vi-Sakha';
textarea.dispatchEvent(new Event('input', { bubbles: true }));
```

### Test 3: Check Filtered Suggestions
```javascript
// This would be in the component, but you can check if filtering works
const questions = [
  'What is Vi-Sakha and how does it work?',
  'What are the key features of Vi-Sakha?',
  // ... more
];
const search = 'features';
const filtered = questions.filter(q => q.toLowerCase().includes(search.toLowerCase()));
console.log('Filtered:', filtered);
```

---

## 📊 Expected Behavior

### When You Type "What is"

**Console Output:**
```
[Autocomplete] Monitoring textarea: prompt-textarea
[Autocomplete] Input event: W
[Autocomplete] Input event: Wh
[Autocomplete] Input event: Wha
[Autocomplete] Input event: What
[Autocomplete] Input event: What 
[Autocomplete] Input event: What i
[Autocomplete] Input event: What is
[Autocomplete] After debounce, value: What is
```

**Visual Output:**
- Dropdown appears above input
- Shows 5+ suggestions starting with "What"
- First suggestion is highlighted
- Header shows "X suggestions • Use ↑↓..."

**Keyboard Behavior:**
- ↓ moves to next suggestion
- ↑ moves to previous suggestion
- Tab inserts highlighted suggestion
- Enter inserts highlighted suggestion
- Esc closes dropdown

---

## 🎯 Quick Test Script

Copy and paste this into your browser console:

```javascript
// Autocomplete Test Script
console.log('=== Autocomplete Test ===');

// 1. Check textarea
const textarea = document.getElementById('prompt-textarea');
console.log('1. Textarea found:', !!textarea);

// 2. Check if we can type
if (textarea) {
  textarea.focus();
  console.log('2. Textarea focused');
  
  // 3. Simulate typing
  textarea.value = 'What is Vi-Sakha';
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('3. Input event dispatched');
  
  // 4. Wait for debounce and check
  setTimeout(() => {
    const dropdown = document.querySelector('[class*="absolute"][class*="bottom-full"]');
    console.log('4. Dropdown found:', !!dropdown);
    
    if (dropdown) {
      console.log('✅ Autocomplete is working!');
    } else {
      console.log('❌ Dropdown not found. Check:');
      console.log('   - Component rendered?');
      console.log('   - CSS hiding it?');
      console.log('   - JavaScript errors?');
    }
  }, 500);
}

console.log('=== Test Complete ===');
```

---

## 🔄 If Nothing Works

### Nuclear Option: Complete Reset

```bash
# Stop containers
docker compose down

# Remove volumes (WARNING: Deletes data!)
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache

# Start fresh
docker compose up -d
```

### Check Docker Logs
```bash
# In sakha-project directory
docker compose logs api -f

# Look for:
# - Build errors
# - Runtime errors
# - Missing files
```

---

## 📞 Getting Help

### Information to Provide

When asking for help, include:

1. **Browser Console Output**
   - Copy all messages
   - Include any errors (red text)

2. **Network Tab**
   - Press F12 → Network
   - Reload page
   - Check if all files loaded (no 404s)

3. **Elements Tab**
   - Search for "prompt-textarea"
   - Search for "autocomplete" or "suggestion"
   - Screenshot the HTML structure

4. **What You Tried**
   - Steps you followed
   - What you expected
   - What actually happened

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Console shows "[Autocomplete] Monitoring textarea"
2. ✅ Typing shows "[Autocomplete] Input event" messages
3. ✅ After 300ms, dropdown appears
4. ✅ Suggestions are filtered based on input
5. ✅ First suggestion is highlighted
6. ✅ Arrow keys navigate suggestions
7. ✅ Tab key inserts suggestion
8. ✅ Dropdown closes after selection

---

## 🎓 Understanding the Flow

```
User types "What"
    ↓
Input event fires
    ↓
Debounce timer starts (300ms)
    ↓
Timer completes
    ↓
Search value set to "What"
    ↓
Suggestions filtered (case-insensitive)
    ↓
Dropdown opens with filtered results
    ↓
First suggestion highlighted
    ↓
User presses Tab
    ↓
Suggestion inserted into textarea
    ↓
Dropdown closes
    ↓
Focus returns to textarea
```

---

## 🚀 Next Steps

Once it's working:

1. **Try different keywords**:
   - "features"
   - "setup"
   - "troubleshoot"
   - "how"

2. **Test keyboard shortcuts**:
   - Arrow keys
   - Tab
   - Enter
   - Escape

3. **Test mouse**:
   - Click suggestions
   - Click outside to close

4. **Provide feedback**:
   - What works well?
   - What could be better?
   - Any bugs or issues?

---

**Good luck! The autocomplete should be working now. Check the console for debug messages!** 🎉

*Last Updated: April 18, 2026*
