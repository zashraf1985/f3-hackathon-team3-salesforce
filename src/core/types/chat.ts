/**
 * @fileoverview Unified chat types for AgentDock
 */

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'file' | 'image' | 'code';

export interface MessageMetadata {
  filename?: string;
  mimeType?: string;
  language?: string;
  contextId?: string;
  model?: string;
  tokens?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  type: MessageType;
  createdAt: number;
  metadata?: MessageMetadata;
}

export interface StreamChunk {
  messageId: string;
  ourMessageId?: string;
  sequence: number;
  content: string;
  done: boolean;
}

export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface ConversationContext {
  id: string;
  messages: Message[];
  systemPrompt?: string;
  metadata: Record<string, unknown>;
} 