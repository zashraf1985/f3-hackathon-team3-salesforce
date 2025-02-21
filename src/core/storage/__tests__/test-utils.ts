/**
 * @fileoverview Test utilities for database testing
 */

import { Client } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL or DATABASE_URL environment variable is required');
}

/**
 * Create a test database client
 */
export function createTestClient() {
  return new Client({
    connectionString: TEST_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : undefined
  });
}

/**
 * Clean up test data
 */
export async function cleanupTestData(client: Client) {
  await client.query('TRUNCATE TABLE documents');
}

/**
 * Generate test embedding
 */
export function generateTestEmbedding(dimension: number = 1536): number[] {
  return Array.from({ length: dimension }, () => Math.random());
}

/**
 * Wait for database to be ready
 */
export async function waitForDatabase(maxAttempts: number = 5): Promise<void> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const client = createTestClient();
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      return;
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        throw new Error('Database connection failed after max attempts');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
} 