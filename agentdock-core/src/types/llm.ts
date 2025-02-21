/**
 * @fileoverview Edge-compatible LLM type definitions
 */

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  createdAt?: number;
}

export interface LLMConfig {
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMProvider {
  generateStream(messages: LLMMessage[], config: LLMConfig): Promise<ReadableStream>;
  generateText(messages: LLMMessage[], config: LLMConfig): Promise<string>;
}

export interface LLMAdapter {
  provider: LLMProvider;
  config: LLMConfig;
  generateStream(messages: LLMMessage[]): Promise<ReadableStream>;
  generateText(messages: LLMMessage[]): Promise<string>;
} 