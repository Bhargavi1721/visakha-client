# 🚀 Vi-Sakha Autocomplete - User Guide

## What is Autocomplete?

Autocomplete (also called typeahead) helps you type faster by suggesting complete questions as you type. It works just like VS Code or Google Colab!

---

## ⌨️ How to Use

### 1. Start Typing

Just start typing your question in the chat input box:

```
You type: "What is"
```

### 2. Wait for Suggestions (300ms)

After a brief moment, you'll see a dropdown with suggestions:

```
┌─────────────────────────────────────────────────┐
│ 🔍 3 suggestions • Use ↑↓ to navigate • Tab... │
├─────────────────────────────────────────────────┤
│ ❓ What is Vi-Sakha and how does it work?      │ ← Highlighted
│ ❓ What are the key features of Vi-Sakha?      │
│ ❓ What are the system requirements?           │
└─────────────────────────────────────────────────┘
```

### 3. Select a Suggestion

**Option A: Press Tab** (Fastest! ⚡)
```
Press: Tab
Result: "What is Vi-Sakha and how does it work?"
```

**Option B: Press Enter**
```
Press: Enter
Result: "What is Vi-Sakha and how does it work?"
```

**Option C: Click with Mouse**
```
Click: Any suggestion
Result: That suggestion fills the input
```

---

## 🎮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Tab** | ⚡ Select highlighted suggestion (FASTEST!) |
| **Enter** | Select highlighted suggestion |
| **↓** (Arrow Down) | Move to next suggestion |
| **↑** (Arrow Up) | Move to previous suggestion |
| **Esc** | Close suggestions |

---

## 💡 Pro Tips

### Tip 1: Use Tab for Speed
Tab is the fastest way to complete suggestions - just like in VS Code!

```
Type: "feat"
See: "What are the key features of Vi-Sakha?"
Press: Tab
Done! ✅
```

### Tip 2: Navigate with Arrows
Use arrow keys to browse through suggestions:

```
Type: "Vi-Sakha"
Press: ↓ ↓ ↓ (to find the one you want)
Press: Tab (to select)
```

### Tip 3: Matching Text is Highlighted
The text you typed is highlighted in yellow to help you find relevant suggestions quickly.

```
You type: "architecture"
You see: "Can you explain the [architecture] of Vi-Sakha?"
         (architecture is highlighted in yellow)
```

### Tip 4: Start with Keywords
Type important keywords to get better suggestions:

```
Good: "features" → Shows feature-related questions
Good: "setup" → Shows setup-related questions
Good: "troubleshoot" → Shows troubleshooting questions
```

---

## 🎯 Common Use Cases

### Use Case 1: Quick Questions
```
Type: "What"
Select: "What is Vi-Sakha and how does it work?"
Time saved: ~5 seconds
```

### Use Case 2: Exploring Features
```
Type: "features"
Browse: Multiple feature-related questions
Select: The one that matches your need
```

### Use Case 3: Getting Help
```
Type: "how"
See: Various "how-to" questions
Select: The most relevant one
```

---

## ❓ FAQ

### Q: Why don't I see suggestions immediately?

**A:** There's a 300ms delay (debounce) to avoid showing suggestions while you're still typing. This makes the experience smoother.

### Q: Can I still type my own question?

**A:** Yes! Autocomplete is optional. You can:
- Ignore the suggestions and keep typing
- Press Escape to close the dropdown
- Just type your question normally

### Q: What if I don't like any suggestion?

**A:** No problem! Just:
- Press Escape to close suggestions
- Continue typing your own question
- Or ignore the dropdown completely

### Q: Does Tab always select a suggestion?

**A:** Tab only selects when:
- The dropdown is open
- There are suggestions visible
- Otherwise, Tab works normally

### Q: Can I use my mouse?

**A:** Yes! You can:
- Click any suggestion to select it
- Hover to see the hover effect
- Click outside to close the dropdown

---

## 🎨 Visual Guide

### What You'll See

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 5 suggestions • Use ↑↓ • Tab/Enter • Esc to close   │ ← Header
├─────────────────────────────────────────────────────────┤
│ ❓ What is Vi-Sakha and how does it work?              │ ← Active (highlighted)
│ ❓ What are the key features of Vi-Sakha?              │
│ ❓ How can I integrate Vi-Sakha with my workflow?      │
│ ❓ What are the system requirements for Vi-Sakha?      │
│ ❓ How do I set up Vi-Sakha for the first time?        │
└─────────────────────────────────────────────────────────┘
```

### Active Suggestion
- **Background**: Slightly darker/lighter (depending on theme)
- **Text**: Brighter color
- **Icon**: Question mark icon

### Matching Text
- **Highlight**: Yellow background
- **Example**: If you type "setup", the word "setup" in suggestions is highlighted

---

## 🚫 When Suggestions Don't Appear

Suggestions won't show if:

1. **Input is empty** - Start typing first
2. **No matches found** - Try different keywords
3. **Less than 300ms since last keystroke** - Wait a moment
4. **Dropdown was closed with Escape** - Start typing again

---

## 🎓 Learning Path

### Beginner
1. Type a question
2. Wait for suggestions
3. Press Tab to select
4. Done!

### Intermediate
1. Type keywords
2. Use arrow keys to navigate
3. Press Tab to select
4. Learn keyboard shortcuts

### Advanced
1. Type minimal keywords
2. Navigate quickly with arrows
3. Use Tab for instant completion
4. Combine with other features

---

## 📊 Example Workflow

### Scenario: You want to ask about Vi-Sakha features

```
Step 1: Click in the input box
Step 2: Type "feat"
Step 3: See suggestions appear:
        - "What are the key features of Vi-Sakha?" ← Highlighted
        - Other feature-related questions
Step 4: Press Tab
Step 5: Question is filled in!
Step 6: Press Send or edit as needed
```

**Time taken**: ~2 seconds
**Time saved**: ~8 seconds (vs typing the full question)

---

## 🎉 Benefits

### Speed
- ⚡ Type less, get more done
- ⚡ Tab completion is instant
- ⚡ No need to type full questions

### Accuracy
- ✅ No typos in suggested questions
- ✅ Well-formed questions
- ✅ Consistent phrasing

### Discovery
- 🔍 Discover questions you didn't know you could ask
- 🔍 Learn about Vi-Sakha features
- 🔍 Explore different topics

### Convenience
- 👍 Works with keyboard only
- 👍 Works with mouse only
- 👍 Works with both!

---

## 🔧 Customization (Future)

Coming soon:
- Custom question lists
- AI-generated suggestions
- Personalized recommendations
- Category filters
- Recent searches

---

## 💬 Feedback

Love the autocomplete feature? Have suggestions?
- Let us know what works well
- Tell us what could be better
- Share your use cases

---

## 📚 Related Features

- **Follow-up Suggestions**: Appear after AI responses
- **Prompts Command**: Use `/` for prompt templates
- **Mention**: Use `@` to mention models

---

## ✅ Quick Reference Card

```
┌─────────────────────────────────────────┐
│     Vi-Sakha Autocomplete Cheat Sheet   │
├─────────────────────────────────────────┤
│ Start typing → Suggestions appear       │
│ Tab → Select (FASTEST!)                 │
│ Enter → Select                          │
│ ↑↓ → Navigate                           │
│ Esc → Close                             │
│ Click → Select                          │
│ Click outside → Close                   │
└─────────────────────────────────────────┘
```

---

## 🎯 Remember

1. **Tab is your friend** - Use it for quick completion
2. **Wait 300ms** - Suggestions appear after a brief delay
3. **Keywords work best** - Type important words
4. **It's optional** - You can always type your own question
5. **Have fun!** - Explore and discover new questions

---

**Happy typing! 🚀**

*Need help? Ask Vi-Sakha: "How do I use autocomplete?"*

---

*Last Updated: April 18, 2026*
*Version: 1.0.0*
