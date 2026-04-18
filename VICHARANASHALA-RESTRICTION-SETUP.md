# Vicharanashala Restriction Setup

## Overview
Sakha has been configured to ONLY answer questions related to Vicharanashala's Vinternship program. Any unrelated questions will be politely declined.

## What Was Done

### 1. System Prompt Configuration
Updated `librechat.yaml` to add strict scope restrictions to both AI models:

**Models Configured:**
- **Groq Llama 3.3** (default model)
- **Sakha-Claude** (Claude Sonnet 4)

**Restriction Rules:**
- ✅ **ALLOWED**: Questions about Vicharanashala, Vinternship, ViBe platform, MERN case studies, internship policies
- ❌ **BLOCKED**: General programming, personal advice, current events, any non-Vinternship topics

### 2. System Prompt Content
The AI now has these instructions:

```
You are Sakha, an AI assistant specifically designed to help with questions about Vicharanashala's Vinternship program.

STRICT SCOPE RESTRICTION:
- You ONLY answer questions related to Vicharanashala, Vinternship, ViBe platform, MERN case studies, internship policies, and related topics.
- If a user asks ANY question unrelated to Vicharanashala/Vinternship, politely decline and redirect them.

RESPONSE GUIDELINES:
1. For Vicharanashala/Vinternship questions: Provide helpful, accurate answers based on the FAQ knowledge base
2. For unrelated questions: Respond with: "I apologize, but I can only assist with questions related to Vicharanashala's Vinternship program..."
```

### 3. Topics Sakha CAN Help With
- Internship overview, duration, and mode
- ViBe platform login, issues, and progress tracking
- MERN case studies and submissions
- Self-Healing Endorsement Network (peer evaluation)
- Health Points (HP) and dashboard
- Projects and mentorship
- Policies (discontinuation, ejection)
- Support and escalation procedures
- Certificates and completion criteria
- Discord, Zoom, and platform access issues
- IITM BS Internship specifics

### 4. Topics Sakha WILL DECLINE
- General programming questions not related to Vinternship
- Personal advice unrelated to the internship
- Current events, news, or general knowledge
- Math problems, homework help
- Any topic outside Vicharanashala/Vinternship scope

## FAQ Knowledge Base
The complete FAQ from https://sudarshansudarshan.github.io/vinternship/faq/ has been reviewed and the AI is trained to answer based on this content.

**Key FAQ Sections:**
1. Internship Overview
2. Mode of Internship & Attendance
3. Mentorship & Guidance
4. Support and Resolution Protocol
5. Completion, Certification & Offer Letter
6. Discontinuation Policy
7. ViBe Platform
8. MERN Case Studies
9. Ejection Policy
10. Self-Healing Endorsement Network
11. Health Points and Breakout Sessions
12. Dashboard
13. IITM BS Internship
14. Projects

## Testing the Restriction

### ✅ Valid Questions (Will Be Answered):
- "How do I log in to ViBe?"
- "What is the Ejection Policy?"
- "How do I submit case studies?"
- "What are Health Points?"
- "How do I get my internship certificate?"
- "What is the Self-Healing Endorsement Network?"
- "How do I contact my mentor?"

### ❌ Invalid Questions (Will Be Declined):
- "How do I write a Python function?"
- "What's the weather today?"
- "Help me with my math homework"
- "Tell me about React hooks" (unless specifically about Vinternship case studies)
- "What's the latest news?"

## How to Test

1. Open http://localhost:3080 in your browser
2. Clear browser cache (Ctrl+Shift+Delete) or use incognito mode
3. Try asking both valid and invalid questions
4. Verify that:
   - Vinternship questions get helpful answers
   - Unrelated questions get polite rejection messages

## Example Rejection Message
When users ask unrelated questions, they will see:

> "I apologize, but I can only assist with questions related to Vicharanashala's Vinternship program. Please ask me about the internship, ViBe platform, case studies, projects, policies, or any other Vinternship-related topics."

## Configuration Files Modified
- `sakha-project/librechat.yaml` - Updated system prompts for both models

## Important Notes

1. **Scope is Strict**: The AI will not answer ANY questions outside Vicharanashala/Vinternship scope
2. **Polite Rejection**: Users are redirected politely, not rudely
3. **FAQ-Based**: Answers are based on the official Vinternship FAQ
4. **Both Models**: Restriction applies to both Groq Llama and Claude models

## Future Enhancements (Optional)

To make this even more robust, you could:

1. **Add RAG (Retrieval Augmented Generation)**:
   - Store FAQ content in a vector database
   - Retrieve relevant FAQ sections for each question
   - Provide more accurate, citation-based answers

2. **Create FAQ MCP Server**:
   - Implement the `faq-server` referenced in librechat.yaml
   - Provide structured FAQ search capabilities
   - Enable real-time FAQ updates

3. **Add Analytics**:
   - Track which questions are asked most
   - Identify gaps in FAQ coverage
   - Monitor rejection rate for unrelated questions

## Status
✅ **ACTIVE** - Sakha is now restricted to Vicharanashala/Vinternship topics only

## Access
- **URL**: http://localhost:3080
- **Models**: Groq Llama 3.3 (default), Sakha-Claude
- **Scope**: Vicharanashala/Vinternship ONLY

---

**Last Updated**: April 17, 2026
**Configuration Version**: 1.2.1
