/**
 * @fileoverview Salesforce node for basic functionality.
 */

import { z } from 'zod';
import type { Tool } from './types';

// Define Zod schema for parameters
const salesforceParamsSchema = z.object({
  input: z.string().describe('A sample input string for the Salesforce node.')
});

export const salesforceNode: Tool = {
  name: 'salesforce_node',
  description: 'A basic Salesforce node for validating the tool registry and execution flow.',
  parameters: salesforceParamsSchema,
  execute: async (params: z.infer<typeof salesforceParamsSchema>) => {
    return `Salesforce node received: ${params.input}`;
  }
};

// Export tools for registry
export const tools = {
  salesforce_node: salesforceNode
};
