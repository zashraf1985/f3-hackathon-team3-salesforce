import { Message } from 'ai';
import { 
  Tool, 
  createError, 
  ErrorCode,
  logger,
  LogCategory 
} from 'agentdock-core';
import { Anthropic } from '@anthropic-ai/sdk';

// ============================================================================
// TEMPORARY IMPLEMENTATION FOR V1
// This adapter currently only supports Anthropic.
// TODO: MIGRATION - This will be replaced with:
// 1. Generic provider interface
// 2. Support for multiple LLM providers
// 3. Multi-modal message handling
// 4. Proper tool calling support
// Reference: plan_refactor.md Phase 1
// ============================================================================

/**
 * Message types from Vercel AI SDK
 */
type CoreMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  name?: string;
  function_call?: unknown;
};

/**
 * Adapter for the Vercel AI SDK
 */
export class VercelAIAdapter {
  private tools: Tool[];
  private anthropic: Anthropic;

  constructor(config: { apiKey: string }, tools: Tool[] = []) {
    this.tools = tools;
    // TEMPORARY: Direct Anthropic instantiation
    this.anthropic = new Anthropic({
      apiKey: config.apiKey
    });
  }

  /**
   * Generate a streaming response using the Vercel AI SDK
   */
  async generateStream(
    config: {
      model: string;
      temperature?: number;
      maxTokens?: number;
      system?: string; // Added support for system messages
    },
    messages: Message[]
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      console.log('🚀 Starting stream generation:', { config, messages });

      // TEMPORARY: Direct Anthropic message mapping
      const stream = await this.anthropic.messages.create({
        model: config.model,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 1000,
        messages: messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        ...(config.system && { system: config.system }), // Add system message if provided
        stream: true
      });

      console.log('✅ Stream created from Anthropic');

      // Create a text encoder for proper streaming
      const encoder = new TextEncoder();

      return new ReadableStream({
        async start(controller) {
          try {
            console.log('🔄 Starting stream processing');
            let content = '';

            for await (const chunk of stream) {
              if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
                content += chunk.delta.text;
                
                // Format as event stream data according to Vercel AI SDK format
                controller.enqueue(encoder.encode(`data: ${chunk.delta.text}\n\n`));
              }
            }

            // Send end of stream
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            
            // Log final content for debugging
            console.log('🏁 Final response:', { length: content.length });
            
            // Close the stream
            controller.close();
          } catch (error) {
            console.error('❌ Stream processing error:', error);
            controller.error(error);
          }
        },
        cancel() {
          // Handle stream cancellation
          console.log('Stream cancelled');
        }
      });
    } catch (error) {
      console.error('❌ Stream generation error:', error);
      throw error;
    }
  }

  /**
   * Map SDK errors to our error types
   */
  mapError(error: unknown): Error {
    if (error instanceof Error) {
      // Handle abort errors
      if (error.name === 'AbortError') {
        return createError(
          'llm',
          'Request aborted',
          ErrorCode.LLM_REQUEST,
          { originalError: error }
        );
      }

      // Handle rate limit errors
      if (error.message.toLowerCase().includes('rate limit')) {
        return createError(
          'llm',
          'Rate limit exceeded',
          ErrorCode.LLM_RATE_LIMIT,
          { originalError: error }
        );
      }

      // Handle other known errors
      return createError(
        'llm',
        error.message,
        ErrorCode.LLM_EXECUTION,
        { originalError: error }
      );
    }

    // Handle unknown errors
    return createError(
      'llm',
      'Unknown error occurred',
      ErrorCode.LLM_EXECUTION,
      { originalError: error }
    );
  }
} 