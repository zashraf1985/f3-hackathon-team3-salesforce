import { StockPriceNode } from './stock-price.node';

describe('StockPriceNode (Example)', () => {
  let node: StockPriceNode;

  beforeEach(() => {
    node = new StockPriceNode('test-stock-price', {
      currency: 'USD'
    });
  });

  describe('Metadata', () => {
    it('should have correct type', () => {
      expect(node.type).toBe('example.stock.price');
    });

    it('should be marked as example in description', () => {
      expect(node['getDescription']()).toContain('Example');
      expect(node['getDescription']()).toContain('not for production');
    });

    it('should have tool parameters schema', () => {
      expect(StockPriceNode.parameters).toBeDefined();
      expect(StockPriceNode.parameters.shape).toHaveProperty('symbol');
      expect(StockPriceNode.parameters.shape).toHaveProperty('currency');
    });
  });

  describe('execute()', () => {
    it('should return mock price data for valid symbol', async () => {
      const result = await node.execute('AAPL');
      expect(result).toEqual({
        symbol: 'AAPL',
        price: expect.any(Number),
        currency: 'USD',
        timestamp: expect.any(String)
      });
    });

    it('should use configured currency', async () => {
      node = new StockPriceNode('test-stock-price', {
        currency: 'EUR'
      });
      const result = await node.execute('AAPL');
      expect(result.currency).toBe('EUR');
    });

    it('should reject non-string input', async () => {
      await expect(node.execute(123)).rejects.toThrow('Input must be a stock symbol string');
      await expect(node.execute({})).rejects.toThrow('Input must be a stock symbol string');
      await expect(node.execute(null)).rejects.toThrow('Input must be a stock symbol string');
    });
  });
}); 