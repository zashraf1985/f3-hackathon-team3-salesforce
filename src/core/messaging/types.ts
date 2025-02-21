/**
 * @fileoverview Node messaging system types.
 * Defines the core types for node-to-node communication.
 */

/**
 * Message priority levels
 */
export type MessagePriority = 'low' | 'normal' | 'high';

/**
 * Message status
 */
export type MessageStatus = 
  | 'pending'
  | 'processing' 
  | 'streaming'
  | 'completed' 
  | 'failed' 
  | 'retrying';

/**
 * Stream chunk type
 */
export interface StreamChunk<T = unknown> {
  /** Chunk sequence number */
  sequence: number;
  /** Chunk data */
  data: T;
  /** Whether this is the last chunk */
  done: boolean;
}

/**
 * Base message interface
 */
export interface NodeMessage<T = unknown> {
  /** Unique message identifier */
  id: string;
  
  /** Source node identifier */
  sourceId: string;
  
  /** Target node identifier */
  targetId: string;
  
  /** Message type identifier */
  type: string;
  
  /** Message payload */
  payload: T;
  
  /** Message priority */
  priority: MessagePriority;
  
  /** Message status */
  status: MessageStatus;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Last update timestamp */
  updatedAt: number;
  
  /** Number of retry attempts */
  retryCount: number;
  
  /** Maximum retry attempts */
  maxRetries: number;
  
  /** Whether this message supports streaming */
  streaming?: boolean;
  
  /** Current stream chunk if streaming */
  currentChunk?: StreamChunk;
  
  /** Error information if failed */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Message handler function type
 */
export type MessageHandler<T = unknown, R = unknown> = (
  message: NodeMessage<T>
) => Promise<R>;

/**
 * Stream handler function type
 */
export type StreamHandler<T = unknown> = (
  chunk: StreamChunk<T>
) => Promise<void>;

/**
 * Message bus interface
 */
export interface MessageBus {
  /**
   * Send a message to a target node
   */
  send<T>(message: Omit<NodeMessage<T>, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string>;
  
  /**
   * Subscribe to messages of a specific type
   */
  subscribe<T>(type: string, handler: MessageHandler<T>): () => void;
  
  /**
   * Subscribe to stream chunks for a message
   */
  subscribeToStream<T>(messageId: string, handler: StreamHandler<T>): () => void;
  
  /**
   * Unsubscribe from messages
   */
  unsubscribe(type: string): void;
  
  /**
   * Get message by ID
   */
  getMessage(id: string): Promise<NodeMessage | null>;
  
  /**
   * Update message status
   */
  updateStatus(id: string, status: MessageStatus, error?: Error): Promise<void>;

  /**
   * Send a stream chunk for a message
   */
  sendStreamChunk<T>(messageId: string, chunk: StreamChunk<T>): Promise<void>;
}

/**
 * Retry strategy configuration
 */
export interface RetryStrategy {
  /** Maximum number of retry attempts */
  maxRetries: number;
  
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  
  /** Whether to use exponential backoff */
  exponential: boolean;
}

/**
 * Default retry strategy
 */
export const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponential: true
}; 