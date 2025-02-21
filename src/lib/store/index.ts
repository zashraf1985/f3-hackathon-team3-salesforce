'use client';

/**
 * @fileoverview Core state management implementation for AgentDock.
 * Uses Zustand for state management.
 */

import { create } from 'zustand';
import { SecureStorage } from 'agentdock-core';
import { AgentState } from './types';
import type { Store, AgentTemplate, AgentRuntimeSettings } from './types';

// Create a single instance for the store
const storage = SecureStorage.getInstance('agentdock');

export const useAgents = create<Store>((set, get): Store => ({
  agents: [],
  isInitialized: false,
  initialize: async () => {
    try {
      // 1. Load base templates from API
      const response = await fetch('/api/agents/templates');
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      const templates = await response.json();

      // 2. Load runtime settings from storage
      const storedSettings = await storage.get<Record<string, AgentRuntimeSettings>>('agent_runtime_settings') || {};

      // 3. Create agents by combining templates with runtime settings
      const agents = templates.map((template: AgentTemplate) => ({
        ...template,
        state: AgentState.CREATED,
        nodes: [],
        runtimeSettings: storedSettings[template.agentId] || {
          temperature: template.nodeConfigurations?.['llm.anthropic']?.temperature || 0.7,
          maxTokens: template.nodeConfigurations?.['llm.anthropic']?.maxTokens || 4096
        }
      }));

      set({ agents, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize agents:', error);
      set({ isInitialized: true }); // Set initialized even on error
    }
  },
  updateAgentRuntime: async (agentId: string, settings: Partial<AgentRuntimeSettings>) => {
    try {
      const { agents } = get();
      
      // Update runtime settings in storage
      const storedSettings = await storage.get<Record<string, AgentRuntimeSettings>>('agent_runtime_settings') || {};
      storedSettings[agentId] = {
        ...storedSettings[agentId],
        ...settings
      };
      await storage.set('agent_runtime_settings', storedSettings);

      // Update agents in state
      const updatedAgents = agents.map(agent =>
        agent.agentId === agentId
          ? { ...agent, runtimeSettings: { ...agent.runtimeSettings, ...settings } }
          : agent
      );

      set({ agents: updatedAgents });
    } catch (error) {
      console.error('Failed to update agent runtime settings:', error);
      throw error;
    }
  }
})); 