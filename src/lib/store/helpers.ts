import { v4 as uuidv4 } from 'uuid';
import { AgentState, BaseNode, ChatNode, ChatNodeConfig, SecureStorage } from 'agentdock-core';

export interface AgentMetadata {
  state: AgentState;
  createdAt: number;
  lastStateChange: number;
  error?: {
    code: string;
    message: string;
    timestamp: number;
  };
  chatWindow?: {
    url: string;
    isOpen: boolean;
    lastMessage?: {
      content: string;
      timestamp: number;
    };
  };
  systemPrompt?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  storagePath: string;
  isActive: boolean;
  state: AgentState;
  metadata: AgentMetadata;
  maxConcurrency?: number;
  nodes: BaseNode[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateAgentParams {
  name: string;
  description: string;
  storagePath: string;
  maxConcurrency?: number;
  systemPrompt?: string;
}

export interface AgentStoreParams {
  storage?: SecureStorage;
}

export interface AgentStore {
  agents: Agent[];
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  storage: SecureStorage;
}

/**
 * Creates a new agent
 */
export async function createAgent(params: CreateAgentParams): Promise<Agent> {
  const id = uuidv4();
  const now = Date.now();

  const agent: Agent = {
    id,
    name: params.name,
    description: params.description,
    storagePath: params.storagePath,
    isActive: false,
    state: AgentState.CREATED,
    metadata: {
      state: AgentState.CREATED,
      createdAt: now,
      lastStateChange: now,
      systemPrompt: params.systemPrompt
    },
    maxConcurrency: params.maxConcurrency,
    nodes: [],
    createdAt: now,
    updatedAt: now
  };

  // Store agent data
  const storage = SecureStorage.getInstance('agentdock');
  await storage.set(`agent:${agent.id}`, agent);

  return agent;
}

export async function createAgentStore(params: AgentStoreParams = {}): Promise<AgentStore> {
  // Initialize storage
  const storage = params.storage || SecureStorage.getInstance('agentdock');

  // Load agents from storage
  const agents: Agent[] = [];
  const storedAgents = await storage.get('agents');
  if (Array.isArray(storedAgents)) {
    agents.push(...storedAgents);
  }

  // Create store methods
  const addAgent = async (agent: Agent) => {
    agents.push(agent);
    await storage.set('agents', agents);
  };

  const removeAgent = async (id: string) => {
    const index = agents.findIndex(a => a.id === id);
    if (index !== -1) {
      agents.splice(index, 1);
      await storage.set('agents', agents);
      await storage.remove(`agent:${id}`);
    }
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    const agent = agents.find(a => a.id === id);
    if (agent) {
      Object.assign(agent, updates, { updatedAt: Date.now() });
      await storage.set('agents', agents);
      await storage.set(`agent:${id}`, agent);
    }
  };

  return {
    agents,
    addAgent,
    removeAgent,
    updateAgent,
    storage
  };
}

export function createChatNode(id: string): ChatNode {
  return new ChatNode(id, {
    maxHistory: 100,
    includeSystem: true
  });
} 