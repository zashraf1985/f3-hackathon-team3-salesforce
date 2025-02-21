import { Message } from 'ai';
import { 
  CoreMessage, 
  CoreUserMessage, 
  CoreAssistantMessage, 
  CoreSystemMessage,
  CoreToolMessage,
  MessageContent,
  TextContent,
  ToolResultContent,
  isMultipartContent
} from 'agentdock-core';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convert a CoreMessage to Vercel AI SDK Message
 */
export function toAIMessage(message: CoreMessage): Message {
  // Generate a unique ID if not provided
  const id = message.id || uuidv4();
  
  // Handle multi-part content
  const content = isMultipartContent(message.content)
    ? message.content
        .map(part => {
          if (part.type === 'text') return part.text;
          if (part.type === 'image') return `[Image: ${part.alt || 'No description'}]`;
          if (part.type === 'tool_call') return `[Tool Call: ${part.toolName}]`;
          if (part.type === 'tool_result') return `[Tool Result: ${part.toolCallId}]`;
          return '';
        })
        .join('\n')
    : message.content;

  // Convert to Vercel AI SDK Message format
  return {
    id,
    role: message.role === 'tool' ? 'assistant' : message.role, // Map tool messages to assistant
    content,
    createdAt: message.createdAt || new Date()
  };
}

/**
 * Convert a Vercel AI SDK Message to CoreMessage
 */
export function toCoreMessage(message: Message): CoreMessage {
  const baseMessage = {
    id: message.id || uuidv4(),
    createdAt: message.createdAt || new Date()
  };

  switch (message.role) {
    case 'system':
      return {
        ...baseMessage,
        role: 'system',
        content: message.content
      } as CoreSystemMessage;

    case 'user':
      return {
        ...baseMessage,
        role: 'user',
        content: message.content
      } as CoreUserMessage;

    case 'assistant':
      return {
        ...baseMessage,
        role: 'assistant',
        content: message.content
      } as CoreAssistantMessage;

    case 'data':
      // Handle data messages as tool messages with a single result
      const toolResult: ToolResultContent = {
        type: 'tool_result',
        toolCallId: uuidv4(),
        result: message.content
      };
      
      return {
        ...baseMessage,
        role: 'tool',
        content: [toolResult],
        toolCallId: toolResult.toolCallId,
        toolName: 'data'
      } as CoreToolMessage;

    default:
      // Default to assistant message for unknown roles
      return {
        ...baseMessage,
        role: 'assistant',
        content: message.content
      } as CoreAssistantMessage;
  }
}

/**
 * Convert an array of CoreMessages to Vercel AI SDK Messages
 */
export function toAIMessages(messages: CoreMessage[]): Message[] {
  return messages.map(toAIMessage);
}

/**
 * Convert an array of Vercel AI SDK Messages to CoreMessages
 */
export function toCoreMessages(messages: Message[]): CoreMessage[] {
  return messages.map(toCoreMessage);
}

/**
 * Create a new text content part
 */
export function createTextContent(text: string): TextContent {
  return {
    type: 'text',
    text
  };
}

/**
 * Create a new message with the given role and content
 */
export function createMessage(role: CoreMessage['role'], content: string | MessageContent[]): CoreMessage {
  const baseMessage = {
    id: uuidv4(),
    createdAt: new Date()
  };

  switch (role) {
    case 'system':
      return { 
        ...baseMessage, 
        role,
        content: typeof content === 'string' ? content : content[0].type === 'text' ? content[0].text : ''
      } as CoreSystemMessage;

    case 'user':
      return { 
        ...baseMessage, 
        role,
        content
      } as CoreUserMessage;

    case 'assistant':
      return { 
        ...baseMessage, 
        role,
        content
      } as CoreAssistantMessage;

    case 'tool':
      if (typeof content === 'string' || !content.every(part => part.type === 'tool_result')) {
        throw new Error('Tool messages must contain only tool results');
      }
      return { 
        ...baseMessage, 
        role,
        content: content as ToolResultContent[],
        toolCallId: content[0].toolCallId,
        toolName: 'unknown'
      } as CoreToolMessage;
  }
} 