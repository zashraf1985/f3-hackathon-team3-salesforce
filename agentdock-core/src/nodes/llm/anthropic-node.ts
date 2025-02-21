/**
 * @fileoverview Anthropic LLM node implementation using Vercel AI SDK.
 */

import { LLMNode, LLMMessage, LLMConfig } from './llm-node';
import { streamText } from 'ai';
import { Anthropic } from '@anthropic-ai/sdk';
import { createError, ErrorCode } from '../../errors';

/**
 * Anthropic-specific configuration
 */
interface AnthropicConfig extends LLMConfig {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * Anthropic implementation of LLM node
 */
export class AnthropicNode extends LLMNode {
  readonly type = 'llm.anthropic';
  private anthropic: Anthropic;

  constructor(config: AnthropicConfig) {
    super(config);
    // Initialize Anthropic client
    this.anthropic = new Anthropic({
      apiKey: config.apiKey || ''
    });
  }

  /**
   * Get static node metadata
   */
  static getNodeMetadata() {
    return {
      category: 'core' as const,
      label: 'Anthropic',
      description: 'Anthropic language model with streaming support',
      inputs: [{
        id: 'messages',
        type: 'array',
        label: 'Messages',
        required: true
      }],
      outputs: [{
        id: 'response',
        type: 'stream',
        label: 'Response Stream'
      }],
      version: '1.0.0',
      compatibility: {
        core: true,
        pro: true,
        custom: false
      }
    };
  }

  protected getLabel(): string {
    return 'Anthropic';
  }

  protected getDescription(): string {
    return 'Anthropic language model with streaming support';
  }

  protected getProvider(): string {
    return 'anthropic';
  }

  protected async generateConfig(messages: LLMMessage[], apiKey: string): Promise<AnthropicConfig> {
    if (!this.config.model) {
      throw createError('llm', 'Model must be specified for Anthropic integration', ErrorCode.LLM_VALIDATION);
    }

    return {
      ...this.config,
      apiKey,
      messages,
      model: this.config.model,
      temperature: this.config.temperature ?? 0.7,
      maxTokens: this.config.maxTokens ?? 1000
    };
  }

  /**
   * Execute the node with streaming support via Vercel AI SDK
   */
  async execute(messages: LLMMessage[]): Promise<ReadableStream<string>> {
    try {
      // Validate input
      if (!this.validateInput(messages)) {
        throw createError('llm', 'Invalid message format', ErrorCode.LLM_REQUEST);
      }

      // Get API key and config
      const apiKey = await this.resolveApiKey();
      const config = await this.generateConfig(messages, apiKey);

      // Use Vercel AI SDK's streamText
      const response = await streamText({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        createStream: async () => {
          const stream = await this.anthropic.messages.create({
            model: config.model,
            temperature: config.temperature ?? 0.7,
            max_tokens: config.maxTokens ?? 1000,
            messages: messages.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            stream: true
          });
          return stream;
        }
      });

      return response.toDataStream();
    } catch (error) {
      throw createError('llm', 'Execution failed', ErrorCode.LLM_EXECUTION, { error });
    }
  }
} 