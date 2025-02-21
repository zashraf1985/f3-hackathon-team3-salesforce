/**
 * @fileoverview Core node types and interfaces for the AgentDock framework.
 * These types form the foundation of the node-based architecture.
 */

import { MessageBus, NodeMessage, MessageHandler } from '../messaging/types';

/**
 * Node metadata containing immutable information about a node.
 */
export interface NodeMetadata {
  /** Category of the node (core or custom) */
  readonly category: 'core' | 'custom';
  /** Display name of the node */
  readonly label: string;
  /** Description of the node's purpose and functionality */
  readonly description: string;
  /** Input ports defining what data the node accepts */
  readonly inputs: readonly NodePort[];
  /** Output ports defining what data the node produces */
  readonly outputs: readonly NodePort[];
}

/**
 * Port definition for node inputs and outputs.
 */
export interface NodePort {
  /** Unique identifier for the port */
  readonly id: string;
  /** Data type that the port accepts/produces */
  readonly type: string;
  /** Display name of the port */
  readonly label: string;
  /** Optional schema for validating data */
  readonly schema?: unknown;
  /** Whether this port is required */
  readonly required?: boolean;
  /** Default value for the port */
  readonly defaultValue?: unknown;
}

/**
 * Base node class that all nodes must extend.
 * Provides core functionality and type safety.
 */
export abstract class BaseNode<TConfig = any> {
  /** Unique identifier for the node */
  readonly id: string;
  /** Unique type identifier for the node */
  abstract readonly type: string;
  /** Node configuration (immutable after construction) */
  protected readonly config: TConfig;
  /** Node metadata (immutable after construction) */
  readonly metadata: NodeMetadata;

  /** Message bus for node communication */
  private messageBus?: MessageBus;

  /** Message handlers */
  private handlers: Map<string, MessageHandler> = new Map();

  constructor(id: string, config: TConfig) {
    this.id = id;
    this.config = Object.freeze({ ...config });
    this.metadata = Object.freeze(this.getMetadata());
  }

  /**
   * Set message bus for node communication
   */
  setMessageBus(messageBus: MessageBus): void {
    this.messageBus = messageBus;
    this.registerMessageHandlers();
  }

  /**
   * Send a message to another node
   */
  protected async sendMessage<T>(
    targetId: string,
    type: string,
    payload: T,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<string> {
    if (!this.messageBus) {
      throw new Error('Message bus not initialized');
    }

    return this.messageBus.send({
      sourceId: this.id,
      targetId,
      type,
      payload,
      priority,
      retryCount: 0,
      maxRetries: 3 // Use default retry count
    });
  }

  /**
   * Register message handlers for this node
   */
  protected registerMessageHandlers(): void {
    if (!this.messageBus) return;

    // Register handlers defined by the node
    for (const [type, handler] of this.handlers) {
      this.messageBus.subscribe(type, handler);
    }
  }

  /**
   * Add a message handler
   */
  protected addMessageHandler<T>(type: string, handler: MessageHandler<T>): void {
    this.handlers.set(type, handler as MessageHandler);
    
    // If message bus is already set, register the handler
    if (this.messageBus) {
      this.messageBus.subscribe(type, handler);
    }
  }

  /**
   * Remove a message handler
   */
  protected removeMessageHandler(type: string): void {
    this.handlers.delete(type);
    this.messageBus?.unsubscribe(type);
  }

  /**
   * Get the complete metadata for this node.
   * This is used both by the constructor and can be accessed statically.
   */
  protected getMetadata(): NodeMetadata {
    return {
      category: this.getCategory(),
      label: this.getLabel(),
      description: this.getDescription(),
      inputs: Object.freeze(this.getInputs()),
      outputs: Object.freeze(this.getOutputs())
    };
  }

  /** Get the node category (core or custom) */
  protected abstract getCategory(): 'core' | 'custom';
  
  /** Get the display name of the node */
  protected abstract getLabel(): string;
  
  /** Get the node description */
  protected abstract getDescription(): string;
  
  /** Define the node's input ports */
  protected abstract getInputs(): readonly NodePort[];
  
  /** Define the node's output ports */
  protected abstract getOutputs(): readonly NodePort[];

  /** Execute the node's functionality */
  abstract execute(input: unknown): Promise<unknown>;

  /** Validate input data */
  validateInput(input: unknown): boolean {
    return true; // Override for specific validation
  }

  /** Validate output data */
  validateOutput(output: unknown): boolean {
    return true; // Override for specific validation
  }

  /** Validate port connections */
  validateConnection(sourcePort: string, targetPort: string): boolean {
    return true; // Override for specific connection rules
  }
}

/**
 * Type definition for the BaseNode constructor including static methods.
 */
export interface BaseNodeConstructor {
  new (id: string, config: any): BaseNode;
  getNodeMetadata(): NodeMetadata;
} 