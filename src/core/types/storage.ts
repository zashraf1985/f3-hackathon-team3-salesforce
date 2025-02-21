/**
 * @fileoverview Core storage types and interfaces for the AgentDock framework.
 * Defines the contract for storage providers and their capabilities.
 */

/**
 * Base interface for all storage providers.
 * Provides basic key-value storage operations.
 */
export interface StorageProvider {
  /** Unique identifier for the storage provider type */
  readonly type: string;

  /**
   * Retrieve a value by key
   * @param key The key to retrieve
   * @returns The stored value, or undefined if not found
   */
  get(key: string): Promise<unknown>;

  /**
   * Store a value by key
   * @param key The key to store under
   * @param value The value to store
   */
  set(key: string, value: unknown): Promise<void>;

  /**
   * Delete a value by key
   * @param key The key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * List all stored keys
   * @returns Array of stored keys
   */
  list(): Promise<string[]>;
}

/**
 * Extended interface for vector storage providers.
 * Adds similarity search capabilities.
 */
export interface VectorStorageProvider extends StorageProvider {
  /** Provider type must be 'vector' */
  readonly type: 'vector';

  /**
   * Perform a similarity search
   * @param query The query vector or text
   * @param k Number of results to return
   * @returns Array of similar items with scores
   */
  similaritySearch(query: string, k?: number): Promise<Array<{
    content: string;
    metadata: Record<string, unknown>;
    score: number;
  }>>;

  /**
   * Add vectors to the storage
   * @param vectors Array of vectors with optional IDs and metadata
   */
  upsert(vectors: Array<{
    id?: string;
    values: number[];
    metadata: Record<string, unknown>;
  }>): Promise<void>;
}

/**
 * Configuration for storage providers
 */
export interface StorageConfig {
  /** Type of storage provider */
  type: string;
  /** Provider-specific configuration */
  config: Record<string, unknown>;
}

/**
 * Error class for storage-related operations
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Storage operation result type
 */
export type StorageResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: StorageError;
}; 