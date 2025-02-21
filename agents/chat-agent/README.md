# Chat Assistant Agent

A general-purpose chat assistant powered by Claude 3 Opus, designed for natural and engaging conversations across a wide range of topics.

## Features

- Powered by Claude 3 Opus for high-quality conversations
- Natural language understanding and generation
- Balanced between casual chat and serious discussions
- Configurable conversation history

## Configuration

The agent uses the following modules:
- `llm.anthropic`: Claude 3 Opus model for text generation
- `core.prompt`: Clean prompt template for natural conversations

### Model Settings
- Model: claude-3-opus-20240229
- Temperature: 0.8 (favors creative and engaging responses)
- Max Tokens: 4096 (suitable for detailed conversations)

### Chat Settings
- History Policy: lastN (maintains conversation context)
- History Length: 50 messages (balanced history retention)
- Friendly initial greeting

## Conversation Capabilities

1. General Discussion
   - Open-ended conversations
   - Topic exploration
   - Natural transitions

2. Question Answering
   - Clear explanations
   - Follow-up handling
   - Knowledge sharing

3. Personality
   - Friendly and approachable
   - Adaptable tone
   - Context-aware responses

## Usage Example

```typescript
const agent = new AgentNode('chat', config);
await agent.initialize();

const response = await agent.execute('Tell me about your capabilities.');
console.log(response);
```

## Best Practices

1. Conversation Flow
   - Allow natural topic progression
   - Use follow-up questions
   - Maintain context appropriately

2. Interaction Style
   - Be clear with questions
   - Provide context when needed
   - Use natural language

3. Settings Customization
   - Adjust temperature for desired creativity
   - Configure history length based on needs
   - Customize initial greeting for your use case 
 