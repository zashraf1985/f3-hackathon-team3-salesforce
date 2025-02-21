/**
 * @fileoverview Agent memory system implementation.
 * Provides working memory and long-term storage capabilities.
 */

import { StorageProvider, StorageError } from '../types/storage';

/**
 * Memory entry with metadata
 */
interface MemoryEntry<T = unknown> {
  /** The stored value */
  value: T;
  /** When the entry was created */
  createdAt: number;
  /** When the entry was last accessed */
  lastAccessed: number;
  /** How many times the entry has been accessed */
  accessCount: number;
  /** Optional time-to-live in milliseconds */
  ttl?: number;
}

/**
 * Memory query options
 */
interface MemoryQueryOptions {
  /** Maximum number of results */
  limit?: number;
  /** Sort order for results */
  sort?: 'asc' | 'desc';
  /** Filter by creation time */
  createdAfter?: number;
  /** Filter by last access time */
  accessedAfter?: number;
  /** Only return entries accessed at least N times */
  minAccessCount?: number;
}

/**
 * Agent memory system implementation
 */
export class AgentMemory {
  /** Working memory store */
  private workingMemory: Map<string, MemoryEntry>;
  /** Long-term storage provider */
  private storage: StorageProvider;
  /** Memory cleanup interval */
  private cleanupInterval: NodeJS.Timeout;

  constructor(storage: StorageProvider) {
    this.workingMemory = new Map();
    this.storage = storage;
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  /**
   * Store a value in working memory
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const entry: MemoryEntry<T> = {
      value,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      ttl
    };
    this.workingMemory.set(key, entry);
  }

  /**
   * Retrieve a value from working memory
   */
  get<T>(key: string): T | undefined {
    const entry = this.workingMemory.get(key) as MemoryEntry<T>;
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (entry.ttl && Date.now() - entry.createdAt > entry.ttl) {
      this.workingMemory.delete(key);
      return undefined;
    }

    // Update access metadata
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    return entry.value;
  }

  /**
   * Store a value in long-term storage
   */
  async store<T>(key: string, value: T): Promise<void> {
    try {
      const entry: MemoryEntry<T> = {
        value,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 0
      };
      await this.storage.set(key, entry);
    } catch (error) {
      throw new StorageError(
        'Failed to store in long-term memory',
        'STORE_ERROR',
        error
      );
    }
  }

  /**
   * Retrieve a value from long-term storage
   */
  async retrieve<T>(key: string): Promise<T | undefined> {
    try {
      const entry = await this.storage.get(key) as MemoryEntry<T>;
      if (!entry) {
        return undefined;
      }

      // Update access metadata
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      await this.storage.set(key, entry);

      return entry.value;
    } catch (error) {
      throw new StorageError(
        'Failed to retrieve from long-term memory',
        'RETRIEVE_ERROR',
        error
      );
    }
  }

  /**
   * Query working memory entries
   */
  query(options: MemoryQueryOptions = {}): Array<[string, unknown]> {
    let entries = Array.from(this.workingMemory.entries());

    // Apply filters
    if (options.createdAfter) {
      entries = entries.filter(([_, entry]) => entry.createdAt > options.createdAfter!);
    }
    if (options.accessedAfter) {
      entries = entries.filter(([_, entry]) => entry.lastAccessed > options.accessedAfter!);
    }
    if (options.minAccessCount) {
      entries = entries.filter(([_, entry]) => entry.accessCount >= options.minAccessCount!);
    }

    // Sort entries
    entries.sort(([_, a], [__, b]) => {
      const order = options.sort === 'desc' ? -1 : 1;
      return (a.lastAccessed - b.lastAccessed) * order;
    });

    // Apply limit
    if (options.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries.map(([key, entry]) => [key, entry.value]);
  }

  /**
   * Clear working memory
   */
  clear(): void {
    this.workingMemory.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.workingMemory.entries()) {
      if (entry.ttl && now - entry.createdAt > entry.ttl) {
        this.workingMemory.delete(key);
      }
    }
  }

  /**
   * Stop the memory system
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
} 