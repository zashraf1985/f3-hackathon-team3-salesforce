/**
 * Server-side storage utility for managing settings and configurations
 */

import { EventEmitter } from 'events';

interface AgentSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  instructions?: string;
  apiKey?: string;
}

// Create a singleton event emitter for settings changes
export const settingsEmitter = new EventEmitter();

// In-memory storage for development
const storage = new Map<string, any>();

// Initialize with default global settings
storage.set('global_settings', {
  apiKeys: {
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    openai: ''
  },
  core: {
    byokOnly: false
  }
});

export class ServerStorage {
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      // Get from storage
      const value = storage.get(key);
      
      // If not found and it's agent settings, return defaults
      if (!value && key.startsWith('agent_settings_')) {
        return {
          model: 'claude-3-opus-20240229',
          temperature: 0.7,
          maxTokens: 4096,
          systemPrompt: "You are a helpful AI assistant specialized in research. You can help users find information, analyze data, and understand complex topics across various fields.",
          apiKey: process.env.ANTHROPIC_API_KEY || ''
        } as T;
      }
      
      return value as T || null;
    } catch (error) {
      console.error('Error retrieving from server storage:', error);
      return null;
    }
  }

  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      console.log('Setting item in server storage:', { key, value });
      
      // Validate agent settings
      if (key.startsWith('agent_settings_')) {
        const settings = value as unknown as AgentSettings;
        if (!settings.model || typeof settings.temperature !== 'number' || !settings.maxTokens) {
          throw new Error('Invalid agent settings format');
        }

        // Store in Map
        storage.set(key, value);

        // Emit settings change event
        const agentId = key.replace('agent_settings_', '');
        settingsEmitter.emit('settingsChanged', { agentId, settings });
      } else {
        // Store non-agent settings
        storage.set(key, value);
      }
    } catch (error) {
      console.error('Error setting item in server storage:', error);
      throw error;
    }
  }

  // Helper method to clear storage (useful for testing)
  static async clear(): Promise<void> {
    storage.clear();
    // Reinitialize default global settings
    storage.set('global_settings', {
      apiKeys: {
        anthropic: process.env.ANTHROPIC_API_KEY || '',
        openai: ''
      },
      core: {
        byokOnly: false
      }
    });
  }
} 