/**
 * @fileoverview Core message type definitions for AgentDock
 */

// Base message roles
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Message content types
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  url: string;
  alt?: string;
}

export interface ToolCallContent {
  type: 'tool_call';
  toolName: string;
  toolCallId: string;
  args: Record<string, any>;
}

export interface ToolResultContent {
  type: 'tool_result';
  toolCallId: string;
  result: any;
}

export type MessageContent = TextContent | ImageContent | ToolCallContent | ToolResultContent;

// Base message interface
export interface BaseMessage {
  id: string;
  role: MessageRole;
  content: string | MessageContent[];
  createdAt?: Date;
}

// Specific message types
export interface CoreUserMessage extends BaseMessage {
  role: 'user';
  content: string | (TextContent | ImageContent)[];
}

export interface CoreAssistantMessage extends BaseMessage {
  role: 'assistant';
  content: string | (TextContent | ToolCallContent)[];
}

export interface CoreSystemMessage extends BaseMessage {
  role: 'system';
  content: string;
}

export interface CoreToolMessage extends BaseMessage {
  role: 'tool';
  content: ToolResultContent[];
  toolCallId: string;
  toolName: string;
}

// Union type for all message types
export type CoreMessage = CoreUserMessage | CoreAssistantMessage | CoreSystemMessage | CoreToolMessage;

// Type guards
export const isUserMessage = (message: CoreMessage): message is CoreUserMessage => 
  message.role === 'user';

export const isAssistantMessage = (message: CoreMessage): message is CoreAssistantMessage => 
  message.role === 'assistant';

export const isSystemMessage = (message: CoreMessage): message is CoreSystemMessage => 
  message.role === 'system';

export const isToolMessage = (message: CoreMessage): message is CoreToolMessage => 
  message.role === 'tool';

export const isMultipartContent = (content: string | MessageContent[]): content is MessageContent[] => 
  Array.isArray(content); 