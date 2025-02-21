/**
 * @fileoverview Custom hooks for accessing the AgentDock store.
 * Provides type-safe hooks for accessing store slices and actions.
 * 
 * @module lib/store/hooks
 */

import { useStore } from './index';
import type { Store } from './types';

// Type-safe hooks for accessing store slices

/**
 * Hook to access all agents in the system.
 * @returns Array of all agents
 */
export const useAgents = () => useStore((state) => state.agents);

/**
 * Hook to access the currently active agent.
 * @returns The active agent or undefined if none is active
 */
export const useActiveAgent = () => {
  const activeAgentId = useStore((state) => state.activeAgentId);
  const agents = useStore((state) => state.agents);
  return agents.find((agent) => agent.id === activeAgentId);
};

// Action hooks

/**
 * Hook to access agent management actions.
 * @returns Object containing all agent-related actions
 */
export const useAgentActions = () => ({
  addAgent: useStore((state) => state.addAgent),
  removeAgent: useStore((state) => state.removeAgent),
  updateAgent: useStore((state) => state.updateAgent),
  setActiveAgent: useStore((state) => state.setActiveAgent),
});

/**
 * Hook to access node management actions.
 * @returns Object containing all node-related actions
 */
export const useNodeActions = () => ({
  addNode: useStore((state) => state.addNode),
  removeNode: useStore((state) => state.removeNode),
  updateNode: useStore((state) => state.updateNode),
});

/**
 * Hook to access application state and actions.
 * @returns Object containing app state and management actions
 */
export const useAppState = () => ({
  isInitialized: useStore((state) => state.isInitialized),
  initialize: useStore((state) => state.initialize),
  reset: useStore((state) => state.reset),
}); 