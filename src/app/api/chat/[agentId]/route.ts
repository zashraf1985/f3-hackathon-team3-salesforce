import { NextRequest } from 'next/server';
import { Message, streamText } from 'ai';
import { anthropic, createAnthropic } from '@ai-sdk/anthropic';
import { APIError, ErrorCode, logger, LogCategory, loadAgentConfig } from 'agentdock-core';
import { templates } from '@/generated/templates';
import { ConfigCache } from '@/lib/services/config-cache';

// ============================================================================
// TEMPORARY IMPLEMENTATION FOR V1
// This is a simplified implementation using direct message handling.
// TODO: MIGRATION - This will be replaced with:
// 1. Full CoreMessage type support
// 2. Multi-part message handling
// 3. Provider abstraction
// Reference: plan_refactor.md Phase 1
// ============================================================================

export const runtime = 'edge';

// Supported file types and their handlers
const SUPPORTED_FILE_TYPES = {
  'image/png': true,
  'image/jpeg': true,
  'image/jpg': true,
  'image/gif': true,
  'image/webp': true,
  'application/pdf': true,
  'text/plain': true,
  'text/markdown': true,
  'text/csv': true,
  'application/json': true
} as const;

type SupportedFileType = keyof typeof SUPPORTED_FILE_TYPES;

// Validate file type
const isValidFileType = (type: string): type is SupportedFileType => {
  return type in SUPPORTED_FILE_TYPES;
}

interface StreamResponse {
  messages: Message[];
}

// Maximum retries for connection errors
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to check if error is a connection error
const isConnectionError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message.includes('ECONNRESET') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network error') ||
    error.message.includes('connection closed') ||
    error.message.includes('aborted')
  );
};

// Retry wrapper for streamText
async function retryStreamText(params: Parameters<typeof streamText>[0], retries = MAX_RETRIES): Promise<ReturnType<typeof streamText>> {
  try {
    return await streamText(params);
  } catch (error) {
    if (isConnectionError(error) && retries > 0) {
      await logger.warn(
        LogCategory.API,
        'ChatRoute',
        `Connection error, retrying (${retries} attempts left)`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      await delay(RETRY_DELAY);
      return retryStreamText(params, retries - 1);
    }
    throw error;
  }
}

export async function POST(req: NextRequest, { params }: { params: { agentId: string } }) {
  try {
    const { messages, experimental_attachments, id, system } = await req.json();
    const agentId = (await params).agentId.split('?')[0];
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      throw new APIError(
        'API key is required',
        ErrorCode.CONFIG_NOT_FOUND,
        req.url,
        'POST',
        { agentId }
      );
    }

    // Get template first - we need this for version checking
    const template = templates[agentId as keyof typeof templates];
    if (!template) {
      throw new APIError(
        'Template not found',
        ErrorCode.CONFIG_NOT_FOUND,
        req.url,
        'POST',
        { agentId }
      );
    }

    // Try to get from cache first
    const configCache = ConfigCache.getInstance();
    const cachedConfig = await configCache.get(agentId, template.version);
    
    let config;
    if (cachedConfig) {
      config = cachedConfig;
    } else {
      // Load and validate configuration
      const agentConfig = await loadAgentConfig(template, apiKey);
      const llmConfig = agentConfig.nodeConfigurations?.['llm.anthropic'];

      if (!llmConfig) {
        throw new APIError(
          'LLM configuration not found',
          ErrorCode.CONFIG_NOT_FOUND,
          req.url,
          'POST',
          { agentId }
        );
      }

      config = {
        name: agentConfig.name,
        description: agentConfig.description,
        model: llmConfig.model || 'claude-3-opus-20240229',
        temperature: llmConfig.temperature ?? 0.7,
        maxTokens: llmConfig.maxTokens ?? 1000,
        modules: agentConfig.modules,
        personality: agentConfig.personality,
        chatSettings: agentConfig.chatSettings
      };

      // Cache the configuration with template version
      await configCache.set(agentId, config, template.version);
    }

    // Create Anthropic provider with API key
    const anthropicProvider = createAnthropic({ apiKey });

    // Log request
    logger.debug(
      LogCategory.API,
      'ChatRoute',
      'Processing chat request',
      { 
        agentId,
        messageCount: messages.length,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      }
    );

    try {
      const result = await retryStreamText({
        model: anthropicProvider(config.model),
        messages,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        system: system ?? config.personality,
        ...(experimental_attachments ? { experimental_attachments } : {}),
        async onFinish({ response }) {
          await logger.info(
            LogCategory.API,
            'ChatAPI',
            'Chat completed successfully',
            { 
              id,
              messageCount: response.messages.length,
              hasSystemMessage: !!system
            }
          );
        }
      });

      return result.toDataStreamResponse();
    } catch (error) {
      // Handle connection errors specifically
      if (isConnectionError(error)) {
        await logger.error(
          LogCategory.API,
          'ChatAPI',
          'Connection error during chat after all retries',
          { 
            error: error instanceof Error ? error.message : 'Unknown error',
            agentId,
            messageCount: messages.length
          }
        );
        return new Response(
          JSON.stringify({
            error: 'Connection lost. Please check your internet connection and try again.',
            code: 'ECONNRESET',
            retryable: true
          }),
          { status: 503 }
        );
      }
      throw error;
    }
  } catch (error) {
    await logger.error(
      LogCategory.API,
      'ChatAPI',
      'Failed to process chat',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    // Return appropriate error response
    if (error instanceof APIError) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          code: error.code,
          retryable: false
        }), 
        { status: error.code === ErrorCode.CONFIG_NOT_FOUND ? 400 : 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'An error occurred while processing your request',
        code: 'INTERNAL_ERROR',
        retryable: false
      }), 
      { status: 500 }
    );
  }
} 