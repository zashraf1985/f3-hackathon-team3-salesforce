import { NextRequest } from 'next/server';
import { GET, PUT } from '../route';
import { SecureStorage } from 'agentdock-core';
import { logger } from 'agentdock-core';

// Mock dependencies
jest.mock('agentdock-core', () => ({
  SecureStorage: {
    getInstance: jest.fn().mockReturnValue({
      get: jest.fn(),
      set: jest.fn()
    })
  },
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  },
  createError: jest.fn(),
  ErrorCode: {
    CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
    INTERNAL: 'INTERNAL'
  },
  LogCategory: {
    API: 'API'
  },
  APIError: class extends Error {
    status: number;
    code: string;
    url: string;
    method: string;
    details?: Record<string, unknown>;

    constructor(message: string, code: string, url: string, method: string, details?: Record<string, unknown>, status = 500) {
      super(message);
      this.name = 'APIError';
      this.status = status;
      this.code = code;
      this.url = url;
      this.method = method;
      this.details = details;
    }
    toResponse() {
      return new Response(JSON.stringify({ error: this.message }), { status: this.status });
    }
  }
}));

describe('Agent Config API Route', () => {
  const mockAgentId = 'test-agent';
  const mockConfig = {
    name: 'Test Agent',
    description: 'Test Description',
    model: 'claude-3-opus',
    tools: ['tool1', 'tool2'],
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: 'Test prompt',
    instructions: 'Test instructions'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return stored config if available', async () => {
      // Setup storage mock
      const storage = SecureStorage.getInstance();
      (storage.get as jest.Mock).mockResolvedValueOnce(mockConfig);

      const request = new NextRequest(`http://localhost:3000/api/agents/${mockAgentId}/config`);
      const response = await GET(request, { params: { agentId: mockAgentId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockConfig);
      expect(storage.get).toHaveBeenCalledWith(`agent_settings_${mockAgentId}`);
    });

    it('should fall back to template if no stored config', async () => {
      // Setup storage mock to return null
      const storage = SecureStorage.getInstance();
      (storage.get as jest.Mock).mockResolvedValueOnce(null);

      // Mock fetch for template
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          name: 'Template Agent',
          description: 'Template Description',
          nodeConfigurations: {
            'llm.anthropic': {
              model: 'claude-3-opus',
              temperature: 0.7,
              maxTokens: 4096
            }
          },
          modules: ['tool1', 'tool2'],
          personality: 'Test prompt',
          instructions: 'Test instructions'
        })
      });

      const request = new NextRequest(`http://localhost:3000/api/agents/${mockAgentId}/config`);
      const response = await GET(request, { params: { agentId: mockAgentId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('model', 'claude-3-opus');
      expect(global.fetch).toHaveBeenCalledWith(`/api/agents/templates/${mockAgentId}`);
    });

    it('should handle template not found', async () => {
      // Setup storage mock to return null
      const storage = SecureStorage.getInstance();
      (storage.get as jest.Mock).mockResolvedValueOnce(null);

      // Mock fetch to fail
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const request = new NextRequest(`http://localhost:3000/api/agents/${mockAgentId}/config`);
      const response = await GET(request, { params: { agentId: mockAgentId } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });
  });

  describe('PUT', () => {
    it('should update config in storage', async () => {
      const storage = SecureStorage.getInstance();
      
      const request = new NextRequest(`http://localhost:3000/api/agents/${mockAgentId}/config`, {
        method: 'PUT',
        body: JSON.stringify(mockConfig)
      });

      const response = await PUT(request, { params: { agentId: mockAgentId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
      expect(storage.set).toHaveBeenCalledWith(
        `agent_settings_${mockAgentId}`,
        mockConfig
      );
    });

    it('should handle storage errors', async () => {
      const storage = SecureStorage.getInstance();
      (storage.set as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const request = new NextRequest(`http://localhost:3000/api/agents/${mockAgentId}/config`, {
        method: 'PUT',
        body: JSON.stringify(mockConfig)
      });

      const response = await PUT(request, { params: { agentId: mockAgentId } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
}); 