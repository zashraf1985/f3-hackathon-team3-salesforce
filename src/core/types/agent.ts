/**
 * @fileoverview Core agent types and interfaces for the AgentDock framework.
 * Defines the contract for agents and their lifecycle management.
 */

import { BaseNode } from './node';
import { AgentConfig } from '../../../agentdock-core/src/types/agent-config';

/**
 * Agent lifecycle states
 */
export enum AgentState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error'
}

/**
 * Agent metadata containing runtime information
 */
export interface AgentMetadata {
  /** Current state of the agent */
  state: AgentState;
  /** Last error if any */
  lastError?: Error;
  /** Last successful execution timestamp */
  lastExecutionTime?: Date;
  /** Total number of executions */
  executionCount: number;
}

/**
 * Agent execution context passed to nodes
 */
export interface AgentContext {
  /** Agent configuration */
  config: AgentConfig;
  /** Current agent state */
  state: AgentState;
  /** Working memory for the execution */
  memory: Map<string, unknown>;
}

/**
 * Custom error class for agent-related errors
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly state: AgentState,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

/**
 * Base agent class that all agents must extend
 */
export abstract class BaseAgent {
  /** Agent configuration */
  protected config: AgentConfig;
  /** Current agent state */
  protected state: AgentState = AgentState.IDLE;
  /** Agent metadata */
  protected metadata: AgentMetadata;
  /** Registered nodes */
  protected nodes: Map<string, BaseNode>;
  /** Working memory */
  protected memory: Map<string, unknown>;

  constructor(config: AgentConfig) {
    this.config = config;
    this.nodes = new Map();
    this.memory = new Map();
    this.metadata = {
      state: AgentState.IDLE,
      executionCount: 0
    };
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    try {
      this.setState(AgentState.RUNNING);
      await this.onInitialize();
    } catch (error) {
      this.handleError('Failed to initialize agent', 'INIT_ERROR', error);
    }
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    if (this.state !== AgentState.IDLE) {
      throw new AgentError(
        'Agent must be in IDLE state to start',
        'INVALID_STATE',
        this.state
      );
    }

    try {
      this.setState(AgentState.RUNNING);
      await this.onStart();
    } catch (error) {
      this.handleError('Failed to start agent', 'START_ERROR', error);
    }
  }

  /**
   * Pause the agent
   */
  async pause(): Promise<void> {
    if (this.state !== AgentState.RUNNING) {
      throw new AgentError(
        'Agent must be in RUNNING state to pause',
        'INVALID_STATE',
        this.state
      );
    }

    try {
      this.setState(AgentState.PAUSED);
      await this.onPause();
    } catch (error) {
      this.handleError('Failed to pause agent', 'PAUSE_ERROR', error);
    }
  }

  /**
   * Resume the agent
   */
  async resume(): Promise<void> {
    if (this.state !== AgentState.PAUSED) {
      throw new AgentError(
        'Agent must be in PAUSED state to resume',
        'INVALID_STATE',
        this.state
      );
    }

    try {
      this.setState(AgentState.RUNNING);
      await this.onResume();
    } catch (error) {
      this.handleError('Failed to resume agent', 'RESUME_ERROR', error);
    }
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    if (this.state === AgentState.IDLE) {
      return;
    }

    try {
      this.setState(AgentState.IDLE);
      await this.onStop();
    } catch (error) {
      this.handleError('Failed to stop agent', 'STOP_ERROR', error);
    }
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Get agent metadata
   */
  getMetadata(): AgentMetadata {
    return this.metadata;
  }

  /**
   * Register a node with the agent
   */
  registerNode(node: BaseNode): void {
    if (this.state !== AgentState.IDLE) {
      throw new AgentError(
        'Nodes can only be registered during IDLE state',
        'INVALID_STATE',
        this.state
      );
    }
    this.nodes.set(node.id, node);
  }

  /**
   * Create execution context for nodes
   */
  protected createContext(): AgentContext {
    return {
      config: this.config,
      state: this.state,
      memory: new Map(this.memory)
    };
  }

  /**
   * Update agent state
   */
  protected setState(newState: AgentState): void {
    this.state = newState;
    this.metadata.state = newState;
  }

  /**
   * Handle agent errors
   */
  protected handleError(message: string, code: string, cause?: unknown): void {
    const error = new AgentError(message, code, this.state, cause);
    this.setState(AgentState.ERROR);
    this.metadata.lastError = error;
    throw error;
  }

  /**
   * Lifecycle hooks for subclasses to implement
   */
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onPause(): Promise<void>;
  protected abstract onResume(): Promise<void>;
  protected abstract onStop(): Promise<void>;
}

/**
 * Agent execution result
 */
export interface AgentResult<T = any> {
  /** Execution success status */
  success: boolean;
  /** Result data if successful */
  data?: T;
  /** Error if failed */
  error?: Error;
  /** Execution metadata */
  metadata: {
    /** Execution start time */
    startTime: Date;
    /** Execution end time */
    endTime: Date;
    /** Execution duration in milliseconds */
    duration: number;
  };
} 