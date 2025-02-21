/**
 * @fileoverview Message bus implementation for node communication.
 */

import { v4 as uuidv4 } from 'uuid';
import { MessageBus, NodeMessage, MessageHandler, MessageStatus, RetryStrategy, DEFAULT_RETRY_STRATEGY, StreamHandler, StreamChunk } from './types';

/**
 * In-memory message bus implementation
 */
export class InMemoryMessageBus implements MessageBus {
  private messages: Map<string, NodeMessage> = new Map();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private streamHandlers: Map<string, Set<StreamHandler>> = new Map();
  private retryStrategy: RetryStrategy;

  constructor(retryStrategy: Partial<RetryStrategy> = {}) {
    this.retryStrategy = {
      ...DEFAULT_RETRY_STRATEGY,
      ...retryStrategy
    };
  }

  /**
   * Send a message to a target node
   */
  async send<T>(message: Omit<NodeMessage<T>, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = uuidv4();
    const now = Date.now();

    const fullMessage: NodeMessage<T> = {
      ...message,
      id,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      maxRetries: this.retryStrategy.maxRetries
    };

    this.messages.set(id, fullMessage);

    // Process message asynchronously
    this.processMessage(fullMessage).catch(error => {
      console.error('Failed to process message:', error);
    });

    return id;
  }

  /**
   * Subscribe to messages of a specific type
   */
  subscribe<T>(type: string, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler as MessageHandler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe to stream chunks for a message
   */
  subscribeToStream<T>(messageId: string, handler: StreamHandler<T>): () => void {
    if (!this.streamHandlers.has(messageId)) {
      this.streamHandlers.set(messageId, new Set());
    }

    this.streamHandlers.get(messageId)!.add(handler as StreamHandler);

    // Return unsubscribe function
    return () => {
      const handlers = this.streamHandlers.get(messageId);
      if (handlers) {
        handlers.delete(handler as StreamHandler);
        if (handlers.size === 0) {
          this.streamHandlers.delete(messageId);
        }
      }
    };
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribe(type: string): void {
    this.handlers.delete(type);
  }

  /**
   * Get message by ID
   */
  async getMessage(id: string): Promise<NodeMessage | null> {
    return this.messages.get(id) || null;
  }

  /**
   * Update message status
   */
  async updateStatus(id: string, status: MessageStatus, error?: Error): Promise<void> {
    const message = this.messages.get(id);
    if (!message) {
      throw new Error(`Message ${id} not found`);
    }

    message.status = status;
    message.updatedAt = Date.now();

    if (error) {
      message.error = {
        code: error.name,
        message: error.message,
        details: error
      };
    }

    this.messages.set(id, message);
  }

  /**
   * Send a stream chunk for a message
   */
  async sendStreamChunk<T>(messageId: string, chunk: StreamChunk<T>): Promise<void> {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    // Update message with current chunk
    message.currentChunk = chunk;
    message.status = chunk.done ? 'completed' : 'streaming';
    message.updatedAt = Date.now();
    this.messages.set(messageId, message);

    // Notify stream handlers
    const handlers = this.streamHandlers.get(messageId);
    if (handlers) {
      await Promise.all(
        Array.from(handlers).map(handler => handler(chunk))
      );
    }

    // Clean up handlers if stream is complete
    if (chunk.done) {
      this.streamHandlers.delete(messageId);
    }
  }

  /**
   * Process a message with retries
   */
  private async processMessage<T>(message: NodeMessage<T>): Promise<void> {
    const handlers = this.handlers.get(message.type);
    if (!handlers || handlers.size === 0) {
      await this.updateStatus(message.id, 'failed', new Error(`No handlers found for message type ${message.type}`));
      return;
    }

    await this.updateStatus(message.id, 'processing');

    try {
      // Execute all handlers in parallel
      await Promise.all(
        Array.from(handlers).map(handler =>
          this.executeWithRetry(async () => {
            await handler(message);
          }, message)
        )
      );

      // Only update status to completed if not streaming
      if (message.status !== 'streaming') {
        await this.updateStatus(message.id, 'completed');
      }
    } catch (error) {
      await this.updateStatus(
        message.id,
        'failed',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Execute a function with retry logic
   */
  private async executeWithRetry(
    fn: () => Promise<void>,
    message: NodeMessage
  ): Promise<void> {
    let delay = this.retryStrategy.baseDelay;

    for (let attempt = 0; attempt <= message.maxRetries; attempt++) {
      try {
        await fn();
        return;
      } catch (error) {
        if (attempt === message.maxRetries) {
          throw error;
        }

        // Update retry count and status
        message.retryCount = attempt + 1;
        await this.updateStatus(message.id, 'retrying');

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Calculate next delay with exponential backoff
        if (this.retryStrategy.exponential) {
          delay = Math.min(
            delay * 2,
            this.retryStrategy.maxDelay
          );
        }
      }
    }
  }
} 