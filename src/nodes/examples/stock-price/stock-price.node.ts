/**
 * @fileoverview Example stock price node implementation.
 * This is a reference implementation and should not be used in production.
 */

import { BaseNode } from 'agentdock-core';
import { z } from 'zod';

interface StockPriceConfig {
  apiKey?: string;
  currency?: string;
}

interface StockPriceResult {
  symbol: string;
  price: number;
  currency: string;
  timestamp: string;
}

export class StockPriceNode extends BaseNode<StockPriceConfig> {
  readonly type = 'example.stock.price';

  // Schema for tool parameters
  static parameters = z.object({
    symbol: z.string().describe('Stock symbol to look up (e.g., AAPL)'),
    currency: z.string().optional().describe('Currency to return price in (default: USD)')
  });

  protected getCategory() { return 'custom' as const; }
  protected getLabel() { return 'Stock Price (Example)'; }
  protected getDescription() { 
    return 'Example node that returns mock stock price data. For reference only, not for production use.'; 
  }
  protected getVersion() { return '1.0.0'; }

  protected getCompatibility() {
    return {
      core: true,
      pro: true,
      custom: true
    };
  }

  protected getInputs() {
    return [{
      id: 'symbol',
      type: 'string',
      label: 'Stock Symbol',
      required: true
    }];
  }

  protected getOutputs() {
    return [{
      id: 'price',
      type: 'object',
      label: 'Stock Price Data'
    }];
  }

  async execute(input: unknown): Promise<StockPriceResult> {
    // Validate input
    if (typeof input !== 'string') {
      throw new Error('Input must be a stock symbol string');
    }

    // Mock implementation - returns random price data
    return {
      symbol: input.toUpperCase(),
      price: Math.random() * 1000,
      currency: this.config.currency || 'USD',
      timestamp: new Date().toISOString()
    };
  }
} 