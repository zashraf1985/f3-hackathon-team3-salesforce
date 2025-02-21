/**
 * @fileoverview Core agent configuration types for the AgentDock framework.
 * This file defines the configuration interface for agents while maintaining
 * backward compatibility with existing implementations.
 */

import { z } from 'zod';

/**
 * Core agent configuration interface
 */
export interface AgentConfig {
  /** Version of the agent configuration format */
  version: string;
  
  /** Unique identifier for the agent */
  agentId: string;
  
  /** Display name of the agent */
  name: string;
  
  /** Optional description */
  description: string;
  
  /** Agent personality/system prompt */
  personality: string;
  
  /** Enabled modules/capabilities */
  modules: string[];
  
  /** Node-specific configurations */
  nodeConfigurations: {
    [nodeType: string]: any;
  };
  
  /** Chat-specific settings */
  chatSettings: {
    /** Initial messages to send when chat starts */
    initialMessages?: string[];
    /** Message history retention policy */
    historyPolicy?: 'none' | 'lastN' | 'all';
    /** Number of messages to retain if historyPolicy is 'lastN' */
    historyLength?: number;
  };
  
  /** Maximum concurrent node executions (backward compatibility) */
  maxConcurrency?: number;
  
  /** Custom configuration options (backward compatibility) */
  options?: Record<string, unknown>;
}

/**
 * Zod schema for validating agent configurations
 */
export const AgentConfigSchema = z.object({
  version: z.string(),
  agentId: z.string(),
  name: z.string(),
  description: z.string(),
  personality: z.string(),
  modules: z.array(z.string()),
  nodeConfigurations: z.record(z.any()),
  chatSettings: z.object({
    initialMessages: z.array(z.string()).optional(),
    historyPolicy: z.enum(['none', 'lastN', 'all']).optional(),
    historyLength: z.number().optional(),
  }),
  maxConcurrency: z.number().optional(),
  options: z.record(z.unknown()).optional()
});

/**
 * Type guard to check if an object is a valid AgentConfig
 */
export function isAgentConfig(obj: unknown): obj is AgentConfig {
  return AgentConfigSchema.safeParse(obj).success;
}

/**
 * Helper to create a new agent configuration
 */
export function createAgentConfig(config: Partial<AgentConfig>): AgentConfig {
  const defaultConfig: AgentConfig = {
    version: '1.0',
    agentId: '',
    name: '',
    description: '',
    personality: '',
    modules: [],
    nodeConfigurations: {},
    chatSettings: {}
  };

  return { ...defaultConfig, ...config };
} 