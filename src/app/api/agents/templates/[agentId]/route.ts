import { NextResponse } from 'next/server';
import { createError, ErrorCode, logger, LogCategory } from 'agentdock-core';
import { templates, TemplateId, Template } from '@/generated/templates';

// Use edge runtime for fastest response
export const runtime = 'edge';

// Cache templates for 1 hour, allow stale while revalidating for 24 hours
export const revalidate = 3600;

// Default template type
interface DefaultTemplate {
  agentId: 'default';
  name: string;
  description: string;
  version: '1.0';
  nodeConfigurations: {
    'llm.anthropic': {
      model: 'claude-3-opus-20240229';
      temperature: number;
      maxTokens: number;
      useCustomApiKey: boolean;
    };
  };
  personality: string;
  modules: ['llm.anthropic'];
  chatSettings: {
    initialMessages: string[];
  };
}

const DEFAULT_TEMPLATE: DefaultTemplate = {
  agentId: 'default',
  name: "Default Chat Assistant",
  description: "A general-purpose chat assistant",
  version: "1.0",
  nodeConfigurations: {
    'llm.anthropic': {
      model: 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 4096,
      useCustomApiKey: false
    }
  },
  personality: "You are a helpful AI assistant.",
  modules: ['llm.anthropic'],
  chatSettings: {
    initialMessages: ["Hello! I'm your AI assistant. How can I help you today?"]
  }
};

type AnyTemplate = Template | DefaultTemplate;

export async function GET(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const agentId = (await params).agentId.split('?')[0];
    
    await logger.debug(
      LogCategory.API,
      'TemplateRoute',
      'Template request received',
      { agentId }
    );

    // Use bundled template directly - fastest source
    let template: AnyTemplate | undefined = templates[agentId as TemplateId];
    
    // If not found and it's the default template, use the fallback
    if (!template && agentId === 'default') {
      await logger.info(
        LogCategory.API,
        'TemplateRoute',
        'Using default template fallback',
        { agentId }
      );
      template = DEFAULT_TEMPLATE;
    }

    if (!template) {
      await logger.warn(
        LogCategory.API,
        'TemplateRoute',
        'Template not found',
        { agentId }
      );
      throw createError('storage', 'Template not found', ErrorCode.STORAGE_READ, {
        agentId
      });
    }

    // Validate required fields
    if (!template.nodeConfigurations?.['llm.anthropic']?.model) {
      await logger.error(
        LogCategory.API,
        'TemplateRoute',
        'Invalid template configuration',
        { agentId, template }
      );
      throw createError('storage', 'Invalid template configuration', ErrorCode.STORAGE_READ, {
        agentId
      });
    }

    await logger.debug(
      LogCategory.API,
      'TemplateRoute',
      'Template found and validated',
      { 
        agentId,
        model: template.nodeConfigurations['llm.anthropic'].model,
        version: template.version
      }
    );

    // Return with aggressive caching headers
    return new NextResponse(JSON.stringify(template), {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    await logger.error(
      LogCategory.STORAGE,
      'TemplateRoute',
      'Failed to load template',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    if (error instanceof Error && 'code' in error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === ErrorCode.STORAGE_READ ? 404 : 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load template' },
      { status: 500 }
    );
  }
} 