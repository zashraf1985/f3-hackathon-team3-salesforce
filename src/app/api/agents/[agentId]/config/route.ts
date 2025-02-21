import { NextRequest } from 'next/server';
import { logger, LogCategory } from 'agentdock-core';
import { SecureStorage, createError, ErrorCode } from 'agentdock-core';
import { APIError } from 'agentdock-core';

// Initialize storage
const storage = SecureStorage.getInstance('agentdock');

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;

    await logger.debug(
      LogCategory.API,
      'AgentConfigRoute',
      `Loading config for agent: ${agentId}`
    );

    // Try to get from storage first
    try {
      const storedConfig = await storage.get(`agent_settings_${agentId}`);
      if (storedConfig) {
        await logger.info(
          LogCategory.API,
          'AgentConfigRoute',
          `Found stored config for agent: ${agentId}`
        );
        return Response.json(storedConfig);
      }
    } catch (storageError) {
      await logger.warn(
        LogCategory.API,
        'AgentConfigRoute',
        'Storage error detected, falling back to template',
        { error: storageError instanceof Error ? storageError.message : 'Unknown error' }
      );
    }

    // If not in storage, load from template.json
    const templatePath = `agents/${agentId}/template.json`;
    const response = await fetch(`/api/agents/templates/${agentId}`);
    if (!response.ok) {
      throw new APIError(
        'Template not found',
        ErrorCode.CONFIG_NOT_FOUND,
        request.url,
        'GET',
        { agentId },
        404
      );
    }

    const template = await response.json();
    
    // Convert template to config format
    const config = {
      name: template.name,
      description: template.description,
      model: template.nodeConfigurations?.['llm.anthropic']?.model || "claude-3-opus",
      tools: template.modules || [],
      apiKey: "",  // Templates don't store API keys
      temperature: template.nodeConfigurations?.['llm.anthropic']?.temperature || 0.7,
      maxTokens: template.nodeConfigurations?.['llm.anthropic']?.maxTokens || 4096,
      systemPrompt: template.personality || "",
      instructions: template.instructions || ""
    };

    await logger.info(
      LogCategory.API,
      'AgentConfigRoute',
      `Generated config from template for agent: ${agentId}`
    );

    return Response.json(config);

  } catch (error) {
    await logger.error(
      LogCategory.API,
      'AgentConfigRoute',
      'Error loading agent config',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    if (error instanceof APIError) {
      return error.toResponse();
    }

    const apiError = new APIError(
      'Internal Server Error',
      ErrorCode.INTERNAL,
      request.url,
      'GET',
      { originalError: error instanceof Error ? error.message : 'Unknown error' },
      500
    );

    return apiError.toResponse();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const body = await request.json();

    await logger.debug(
      LogCategory.API,
      'AgentConfigRoute',
      `Updating config for agent: ${agentId}`,
      { config: body }
    );

    // Store in storage
    await storage.set(`agent_settings_${agentId}`, body);

    await logger.info(
      LogCategory.API,
      'AgentConfigRoute',
      `Updated config for agent: ${agentId}`
    );

    return Response.json({ success: true });
  } catch (error) {
    await logger.error(
      LogCategory.API,
      'AgentConfigRoute',
      'Error updating agent config',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    if (error instanceof APIError) {
      return error.toResponse();
    }

    const apiError = new APIError(
      'Internal Server Error',
      ErrorCode.INTERNAL,
      request.url,
      'PUT',
      { originalError: error instanceof Error ? error.message : 'Unknown error' },
      500
    );

    return apiError.toResponse();
  }
} 