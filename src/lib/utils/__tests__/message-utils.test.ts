import { Message } from 'ai';
import { 
  CoreMessage, 
  CoreUserMessage, 
  CoreAssistantMessage, 
  CoreSystemMessage,
  CoreToolMessage,
  TextContent,
  ToolResultContent
} from 'agentdock-core';
import { 
  toAIMessage, 
  toCoreMessage, 
  toAIMessages, 
  toCoreMessages,
  createTextContent,
  createMessage
} from '../message-utils';

describe('Message Utilities', () => {
  describe('toAIMessage', () => {
    it('should convert user message to AI SDK message', () => {
      const input: CoreUserMessage = {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date('2024-02-18')
      };

      const result = toAIMessage(input);
      expect(result.id).toBe('1');
      expect(result.role).toBe('user');
      expect(result.content).toBe('Hello');
      expect(result.createdAt).toEqual(new Date('2024-02-18'));
    });

    it('should convert assistant message to AI SDK message', () => {
      const input: CoreAssistantMessage = {
        id: '2',
        role: 'assistant',
        content: 'How can I help?',
        createdAt: new Date('2024-02-18')
      };

      const result = toAIMessage(input);
      expect(result.id).toBe('2');
      expect(result.role).toBe('assistant');
      expect(result.content).toBe('How can I help?');
      expect(result.createdAt).toEqual(new Date('2024-02-18'));
    });

    it('should convert tool message to assistant message', () => {
      const input: CoreToolMessage = {
        id: '3',
        role: 'tool',
        content: [{
          type: 'tool_result',
          toolCallId: '123',
          result: { sum: 3 }
        }],
        toolCallId: '123',
        toolName: 'calculator',
        createdAt: new Date('2024-02-18')
      };

      const result = toAIMessage(input);
      expect(result.id).toBe('3');
      expect(result.role).toBe('assistant');
      expect(result.content).toContain('Tool Result: 123');
      expect(result.createdAt).toEqual(new Date('2024-02-18'));
    });

    it('should handle multi-part content', () => {
      const input: CoreUserMessage = {
        id: '4',
        role: 'user',
        content: [
          { type: 'text', text: 'Hello' },
          { type: 'image', url: 'https://example.com/image.jpg', alt: 'Example' }
        ],
        createdAt: new Date('2024-02-18')
      };

      const result = toAIMessage(input);
      expect(result.content).toContain('Hello');
      expect(result.content).toContain('[Image: Example]');
    });
  });

  describe('toCoreMessage', () => {
    it('should convert AI SDK user message to core message', () => {
      const input: Message = {
        id: '1',
        role: 'user',
        content: 'Hello',
        createdAt: new Date('2024-02-18')
      };

      const result = toCoreMessage(input);
      expect(result.id).toBe('1');
      expect(result.role).toBe('user');
      expect(result.content).toBe('Hello');
      expect(result.createdAt).toEqual(new Date('2024-02-18'));
    });

    it('should convert AI SDK assistant message to core message', () => {
      const input: Message = {
        id: '2',
        role: 'assistant',
        content: 'How can I help?',
        createdAt: new Date('2024-02-18')
      };

      const result = toCoreMessage(input);
      expect(result.id).toBe('2');
      expect(result.role).toBe('assistant');
      expect(result.content).toBe('How can I help?');
      expect(result.createdAt).toEqual(new Date('2024-02-18'));
    });

    it('should convert AI SDK data message to tool message', () => {
      const input: Message = {
        id: '3',
        role: 'data',
        content: '{"sum": 3}',
        createdAt: new Date('2024-02-18')
      };

      const result = toCoreMessage(input) as CoreToolMessage;
      expect(result.role).toBe('tool');
      expect(result.toolName).toBe('data');
      expect(result.content[0].type).toBe('tool_result');
      expect(result.content[0].result).toBe('{"sum": 3}');
    });
  });

  describe('Array Conversions', () => {
    it('should convert array of core messages to AI SDK messages', () => {
      const input: CoreMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date('2024-02-18')
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi!',
          createdAt: new Date('2024-02-18')
        }
      ];

      const result = toAIMessages(input);
      expect(result.length).toBe(2);
      expect(result[0].role).toBe('user');
      expect(result[1].role).toBe('assistant');
    });

    it('should convert array of AI SDK messages to core messages', () => {
      const input: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          createdAt: new Date('2024-02-18')
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi!',
          createdAt: new Date('2024-02-18')
        }
      ];

      const result = toCoreMessages(input);
      expect(result.length).toBe(2);
      expect(result[0].role).toBe('user');
      expect(result[1].role).toBe('assistant');
    });
  });

  describe('Helper Functions', () => {
    it('should create text content', () => {
      const result = createTextContent('Hello');
      expect(result.type).toBe('text');
      expect(result.text).toBe('Hello');
    });

    it('should create user message', () => {
      const result = createMessage('user', 'Hello');
      expect(result.role).toBe('user');
      expect(result.content).toBe('Hello');
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create tool message with results', () => {
      const toolResult: ToolResultContent = {
        type: 'tool_result',
        toolCallId: '123',
        result: { sum: 3 }
      };

      const result = createMessage('tool', [toolResult]) as CoreToolMessage;
      expect(result.role).toBe('tool');
      expect(result.content[0].type).toBe('tool_result');
      expect(result.toolCallId).toBe('123');
      expect(result.toolName).toBe('unknown');
    });

    it('should throw error for invalid tool message content', () => {
      const textContent: TextContent = {
        type: 'text',
        text: 'Hello'
      };

      expect(() => createMessage('tool', [textContent])).toThrow();
    });
  });
}); 