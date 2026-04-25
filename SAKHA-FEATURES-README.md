
# Sakha - Enhanced LibreChat for Vicharanashala

## Feature Contributors

**AI-Powered Follow-Up Suggestions**: Bhargavi Desaboyina (desaboyinabhargavi@gmail.com)
- Implemented Groq API integration
- Developed context analysis algorithms  
- Created probability-based ranking system

**Question Autocomplete System**: Yamini Kancharla (yaminisatyagangabhavani@gmail.com)
- Built intelligent suggestion matching
- Implemented TAB-to-accept functionality
- Designed FAQ database integration

## Overview

Sakha is an enhanced version of LibreChat, specifically designed for VicharanaShala's Vinternship program. The platform integrates advanced AI-powered features including intelligent follow-up suggestions and contextual question autocomplete to optimize the learning experience for students and reduce support overhead for administrators.

**Repository**: [vicharanashala/sakha-client](https://github.com/vicharanashala/sakha-client)

## Features

### 1. AI-Powered Follow-Up Suggestions

**Smart Context Analysis**: Analyzes the user's original question and AI response to generate relevant follow-up questions

**VicharanaShala-Specific**: Tailored suggestions for Vinternship topics including ViBe platform, case studies, endorsements, health points, projects, policies, support, and certificates

**Groq API Integration**: Uses Groq API with Llama-3.3-70b-versatile model for real-time intelligent suggestion generation

**Probability-Based Ranking**: Suggestions are ranked by likelihood of being asked next, ensuring the most relevant questions appear first

**Interactive UI**: Clickable suggestion buttons that automatically submit questions for seamless conversation flow

### 2. Question Autocomplete (Intelligent Suggestions)

**Local FAQ Matching**: Uses pre-loaded FAQ database for instant suggestions without API calls

**Comprehensive FAQ Database**: 39 pre-loaded Vinternship FAQ questions covering all program aspects

**Tab-to-Accept**: Press TAB to accept suggestions, providing familiar interaction patterns

**Debounced Input**: Optimized performance with 300ms debounce for smooth typing experience

**Smart Matching**: Supports both exact prefix matching and intelligent word-based completion

## Technical Implementation

### Components

#### FollowUpSuggestions.tsx
**Location**: `client/src/components/Chat/Messages/FollowUpSuggestions.tsx`

**Purpose**: Displays AI-generated follow-up questions after AI responses

**Key Features**:
- Only shows for AI responses (not user messages)
- Only displays on the latest message
- Generates 3 contextual suggestions per response
- Automatic submission when suggestion is clicked
- Enhanced error handling with graceful degradation
- Context analysis from conversation history

**Implementation Details**:
```typescript
interface FollowUpSuggestionsProps {
  messageId?: string;
  isLatestMessage: boolean;
  isCreatedByUser: boolean;
  parentMessageId?: string | null;
}

// Enhanced API call with context
const response = await fetch('/api/tools/test-suggestions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    userQuestion: userQuestion,
    aiResponse: aiResponseText
  })
});
```

#### QuestionAutocomplete.tsx
**Location**: `client/src/components/Chat/Input/QuestionAutocomplete.tsx`

**Purpose**: Provides inline autocomplete suggestions while typing

**Key Features**:
- Real-time text matching against FAQ database
- Intelligent positioning and alignment
- TAB key acceptance mechanism
- Form integration with react-hook-form
- Performance optimized with debouncing

**Implementation Details**:
```typescript
interface QuestionAutocompleteProps {
  textAreaRef: React.MutableRefObject<HTMLTextAreaElement | null>;
}

// Smart suggestion matching
const findSuggestion = useCallback((inputValue: string) => {
  const lowerInput = inputValue.toLowerCase();
  
  // Priority 1: Exact prefix match
  const exactMatch = SAKHA_QUESTIONS.find((q) => 
    q.toLowerCase().startsWith(lowerInput)
  );
  
  // Priority 2: Word-based matching
  if (inputValue.length >= 2) {
    const wordMatch = SAKHA_QUESTIONS.find((q) => {
      const words = q.toLowerCase().split(' ');
      return words.some(word => word.startsWith(lowerInput));
    });
    return wordMatch;
  }
  
  return exactMatch || '';
}, []);
```

### API Integration

#### Enhanced Backend Architecture

**API Endpoints**:
```javascript
// Production endpoint (with JWT authentication)
POST /api/tools/ai-suggestions
Authorization: Bearer <jwt-token>

// Test endpoint (no authentication - for development/testing)
POST /api/tools/test-suggestions

// Request body
{
  "userQuestion": "string (required)",
  "aiResponse": "string (optional - used for enhanced context)"
}

// Response format
{
  "suggestions": ["string", "string", "string"],
  "source": "ai-generated" | "ai-partial" | "fallback"
}

// Error response
{
  "error": "string - error description"
}
```

#### Groq API Integration Details

**Backend Implementation** (`sakha-project/api/server/controllers/tools.js`):
```javascript
// Enhanced system prompt for probability-based ranking
const systemPrompt = `You are an expert AI assistant that generates the most likely and valuable follow-up questions based on conversation context.

TASK: Analyze the user's question and AI response to generate exactly 3 follow-up questions that users are MOST LIKELY to ask next.

RANKING CRITERIA (highest probability first):
1. Direct clarification questions about unclear points in the AI response
2. Questions about practical implementation or next steps
3. Questions about related topics mentioned but not fully explained
4. Questions about specific examples or use cases
5. Questions about potential problems or limitations

CONTEXT: Vicharanashala's Vinternship program including ViBe platform, case studies, endorsements, health points, projects, policies, support, certificates.`;

// Groq API call with optimized parameters
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,        // Lower for consistent, probable suggestions
    max_tokens: 150,         // Sufficient for 3 concise questions
    top_p: 0.9,             // Focus on highest probability tokens
    frequency_penalty: 0.2,  // Reduce repetition
    presence_penalty: 0.1    // Encourage topic diversity
  }),
});
```

**Frontend Integration** (`sakha-project/client/src/components/Chat/Messages/FollowUpSuggestions.tsx`):
```javascript
// API call from React component
const response = await fetch('/api/tools/test-suggestions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Include cookies for authentication
  body: JSON.stringify({
    userQuestion: userQuestion,
    aiResponse: aiResponseText // Optional context
  })
});
```

**Important Notes**:
- **Groq API is ONLY used for Follow-Up Suggestions** - provides AI-powered contextual questions
- **Question Autocomplete uses local FAQ database** - no external API calls for instant performance
- **Fallback handling**: If Groq API fails, the system gracefully handles errors without breaking user experience
- **Rate limiting**: Groq API calls are made only after AI responses, not on every user input

## Groq API Integration Summary

**What uses Groq API**: 
- ✅ **Follow-Up Suggestions** - AI-powered contextual questions after AI responses
- ❌ **Question Autocomplete** - Uses local FAQ database for instant performance

**API Details**:
- **Model**: Llama-3.3-70b-versatile
- **Endpoint**: https://api.groq.com/openai/v1/chat/completions  
- **Security**: API key stored securely on backend only
- **Rate Limiting**: Called only after AI responses, not on user input
- **Fallback**: Graceful error handling if API is unavailable

**Performance Optimization**:
- Follow-up suggestions: Real-time AI generation (300-500ms)
- Question autocomplete: Instant local matching (<50ms)
- No API calls during typing for optimal user experience

## Configuration

### Environment Variables

**Required for AI-Powered Follow-Up Suggestions**:
```bash
# Groq API key for AI-powered follow-up suggestions
GROQ_API_KEY=your_groq_api_key_here

# Note: VITE_GROQ_API_KEY is NOT used - all Groq API calls are made from backend for security
```

**Server Configuration**:
```bash
# Application settings
PORT=3080
HOST=localhost
DOMAIN_CLIENT=http://localhost:3080

# Database
MONGO_URI=mongodb://chat-mongodb:27017/LibreChat

# Other LibreChat environment variables as needed
# See .env.example for complete configuration
```

**Security Notes**:
- Groq API key is only stored on the backend server
- Frontend never directly accesses Groq API
- All AI suggestion requests are proxied through backend API endpoints
- Authentication is handled via JWT tokens for production endpoints

### Styling
- Uses Tailwind CSS classes for responsive design
- Consistent with LibreChat's design system
- Hover effects and focus states for accessibility
- Gradient overlays for visual enhancement
- Perfect text alignment for autocomplete suggestions

## User Experience

### Follow-Up Suggestions Flow
1. User asks a question about VicharanaShala/Vinternship
2. AI provides a comprehensive response
3. System automatically analyzes context and generates 3 relevant follow-up questions
4. Questions appear as clickable buttons below the AI response
5. Clicking a suggestion automatically submits it as a new question
6. Conversation flows naturally with contextual continuity

### Autocomplete Flow
1. User starts typing in the chat input
2. System matches input against FAQ database with intelligent algorithms
3. Autocomplete suggestion appears inline
4. User presses TAB to accept or continues typing
5. Suggestion updates in real-time as user types
6. Instant access to comprehensive FAQ responses

## FAQ Database

The autocomplete feature includes 39 pre-loaded questions covering:

**Program Overview**: 
- What is this internship about?
- Is this internship time-bound or duration-based?
- What is the mode of this internship?

**Platform Usage**: 
- How do I log in to ViBe?
- Why are videos stuck or repeating?
- Can I use a mobile or tablet?

**Case Studies**: 
- What are Case Studies?
- How do I submit the case studies?
- Are Case Studies mandatory?

**Ejection Policy**: 
- What is the Ejection Policy?
- What does "Backward Eject" mean?
- Can I avoid being ejected from the program?

**Endorsement System**: 
- What is the Self-Healing Endorsement Network?
- Who are the Jedi and what role do they play?
- How many endorsements can I receive or give?

**Project Phase**: 
- Should we do the projects as a group or as an individual?
- How can we connect with the mentors?
- Is the project phase necessary for completion?

**Support**: 
- Where do I raise my concern initially?
- What if I don't receive a response in 24 hours?
- How do I escalate further?

**Certification**: 
- What are the program completion criteria?
- Where can I find information on certification?
- When will I receive my certificate of completion?

## Benefits

### For Users
- **Faster Discovery**: Quickly find related information without thinking of questions
- **Comprehensive Coverage**: Access to extensive FAQ knowledge base
- **Intuitive Interface**: Familiar autocomplete pattern from modern applications
- **Reduced Typing**: Auto-completion saves time and effort
- **Guided Learning**: AI suggestions guide through natural learning progression

### For VicharanaShala
- **Better Engagement**: Users explore more topics and stay engaged longer
- **Reduced Support Load**: Self-service through comprehensive FAQ suggestions
- **Improved User Journey**: Guided exploration of program features
- **Data Insights**: Understanding of common user question patterns
- **Enhanced Learning Outcomes**: Structured discovery of program information

## Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for development)
- Groq API Key ([Get one here](https://console.groq.com/keys))

### Quick Start
```bash
# Clone the repository
git clone https://github.com/vicharanashala/sakha-client.git
cd sakha-client

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run with Docker
docker-compose up

# Access the application
# Open http://localhost:3080 in your browser
```

### Development Setup
```bash
# Install dependencies
npm install

# Build packages
npm run build:packages

# Start development servers
npm run backend:dev    # Terminal 1
npm run frontend:dev   # Terminal 2
```

## Testing

### Testing Follow-Up Suggestions
1. Navigate to `http://localhost:3080`
2. Submit a question related to VicharanaShala/Vinternship program
3. Wait for the AI response to complete
4. Verify suggestion buttons appear below the AI response
5. Click any suggestion to validate automatic submission functionality
6. Observe contextual adaptation in subsequent suggestions

### Testing Question Autocomplete
1. Focus on the message input field
2. Begin typing partial questions (e.g., "What", "How", "Where")
3. Verify autocomplete suggestions appear inline
4. Press TAB to accept suggestions
5. Test with various question patterns and lengths

### Debugging
Check Browser Console (F12) for debug messages:
```javascript
[Autocomplete] Component mounted and monitoring textarea
[Autocomplete] Input detected: What
[Autocomplete] Suggestion: is this internship about?
[FollowUp] AI-generated suggestions: ["What is ViBe platform?", ...]
```

## Future Enhancements

### Potential Improvements
- **Learning Algorithm**: Track which suggestions are most clicked to improve generation
- **Multi-language Support**: Extend to support regional languages
- **Personalization**: Tailor suggestions based on user's program progress
- **Analytics Dashboard**: Track suggestion usage and effectiveness
- **Voice Integration**: Voice-activated suggestion acceptance

### Technical Optimizations
- **Caching**: Cache frequently generated suggestions
- **Offline Mode**: Local suggestion generation when API is unavailable
- **Performance**: Optimize rendering for large conversation histories
- **Accessibility**: Enhanced screen reader support

## Development Notes

### Dependencies
- React 18+ with hooks
- Lucide React for icons
- Tailwind CSS for styling
- React Hook Form for form integration
- Groq API for AI suggestions

### Testing Considerations
- Test with various question types and lengths
- Verify TAB key behavior across different browsers
- Test API fallback scenarios
- Validate accessibility with screen readers

### Deployment
- Ensure GROQ_API_KEY is properly configured in production
- Monitor API usage and rate limits
- Set up error tracking for suggestion generation failures
- Configure proper CORS settings for API calls

## Contributing

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. Follow existing code patterns
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution
- Bug fixes and improvements
- New FAQ questions
- Enhanced suggestion algorithms
- UI/UX improvements
- Documentation updates

## Support

### Troubleshooting

**Issue**: Follow-up suggestions not appearing  
**Solution**: Verify GROQ_API_KEY configuration and network connectivity

**Issue**: Question autocomplete not functioning  
**Solution**: Verify component mounting and textarea reference functionality

**Issue**: Docker container startup problems  
**Solution**: Ensure sufficient system memory (4GB+) and clear Docker cache if needed

### Getting Help
- Review documentation and troubleshooting guides
- Submit bug reports via GitHub Issues
- Participate in community discussions on GitHub Discussions
- Contact VicharanaShala support team for program-specific assistance

## License

This project is based on LibreChat and maintains the same open-source license. Enhanced features for VicharanaShala are also open-source and available to the community.

## Acknowledgments

- **LibreChat Team**: For the excellent foundation platform
- **Groq**: For providing powerful AI API capabilities for follow-up suggestions
- **VicharanaShala**: For the vision and requirements
- **Community**: For feedback and contributions

---

<p align="center">
  <strong>Built for the VicharanaShala learning community</strong>
</p>

<p align="center">
  <a href="https://github.com/vicharanashala/sakha-client">Star the Repository</a> •
  <a href="https://github.com/vicharanashala/sakha-client/issues">Report Issues</a> •
  <a href="https://github.com/vicharanashala/sakha-client/discussions">Join Discussions</a>
</p>