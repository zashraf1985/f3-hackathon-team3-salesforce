/**
 * @fileoverview Core node registration for AgentDock.
 * This file registers all core nodes with the NodeRegistry.
 */

import { NodeRegistry } from './node-registry';
import { AgentNode } from './agent-node';
import { AnthropicNode } from './llm/anthropic-node';
import { ChatNode } from './chat';

/**
 * Register all core nodes with the registry
 */
export function registerCoreNodes(): void {
  // Register core nodes
  NodeRegistry.register('core.agent', AgentNode, '1.0.0');
  NodeRegistry.register('llm.anthropic', AnthropicNode, '1.0.0');
  NodeRegistry.register('core.chat', ChatNode, '1.0.0');
}

// Register nodes immediately
registerCoreNodes(); 
 