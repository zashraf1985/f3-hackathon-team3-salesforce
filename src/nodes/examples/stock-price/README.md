# Stock Price Node (Example)

This is an example node implementation that demonstrates how to create a custom node in AgentDock. It provides a mock stock price lookup functionality.

**⚠️ This is a reference implementation only and should not be used in production.**

## Description

The Stock Price Node demonstrates:
- Custom node implementation
- Tool parameter schema definition
- Input/output validation
- Configuration handling
- Test structure

## Configuration

```typescript
interface StockPriceConfig {
  apiKey?: string;    // Not used in example
  currency?: string;  // Currency for price (default: USD)
}
```

## Inputs/Outputs

### Inputs
- `symbol` (string) - Stock symbol to look up (e.g., "AAPL")

### Outputs
```typescript
interface StockPriceResult {
  symbol: string;    // Uppercase stock symbol
  price: number;     // Mock price value
  currency: string;  // Currency from config
  timestamp: string; // ISO timestamp
}
```

## Example Usage

```typescript
import { StockPriceNode } from './stock-price.node';

const node = new StockPriceNode('stock-price', {
  currency: 'EUR'
});

const result = await node.execute('AAPL');
console.log(result);
// {
//   symbol: 'AAPL',
//   price: 123.45,
//   currency: 'EUR',
//   timestamp: '2024-02-13T12:34:56.789Z'
// }
```

## Compatibility
- Core: ✓
- Pro: ✓
- Custom: ✓

## Production Status
This is an example node for reference only. For production use:
1. Implement real stock price API integration
2. Add proper error handling
3. Add rate limiting
4. Add caching
5. Add proper API key management 