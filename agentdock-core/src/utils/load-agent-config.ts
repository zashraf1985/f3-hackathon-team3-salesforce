/**
 * @fileoverview Utility function to load and validate agent configurations
 */

import { AgentConfig, AgentConfigSchema } from '../types/agent-config';

/**
 * Load and validate an agent configuration
 * @param agentId - The unique identifier of the agent
 * @returns Promise resolving to the validated agent configuration
 */
export async function loadAgentConfig(agentId: string): Promise<AgentConfig> {
  try {
    // Ensure we're using an absolute URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/agents/${agentId}/config`);
    if (!response.ok) {
      throw new Error(`Failed to load agent configuration: ${response.statusText}`);
    }
    
    const config = await response.json();
    return AgentConfigSchema.parse(config);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error loading or validating config for agent ${agentId}:`, error);
    throw new Error(`Failed to load or validate agent configuration: ${message}`);
  }
} 