/**
 * @fileoverview Test setup and utilities for agentdock-core
 */

// Mock Web Crypto API
const mockCrypto = {
  subtle: {
    generateKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn()
  },
  getRandomValues: jest.fn()
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

// Mock Response
class MockResponse {
  constructor(
    public body: any,
    public init?: ResponseInit
  ) {}

  headers = new Headers(this.init?.headers);
  status = this.init?.status || 200;
  ok = this.status >= 200 && this.status < 300;

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }
}

// Setup global mocks
beforeAll(() => {
  // Setup Web Crypto API mock
  Object.defineProperty(global, 'crypto', {
    value: mockCrypto,
    writable: true
  });

  // Setup localStorage mock
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  // Setup Response mock
  Object.defineProperty(global, 'Response', {
    value: MockResponse,
    writable: true
  });

  // Setup TextEncoder/TextDecoder
  Object.defineProperty(global, 'TextEncoder', {
    value: class {
      encode(str: string) {
        return new Uint8Array([...str].map(c => c.charCodeAt(0)));
      }
    },
    writable: true
  });

  Object.defineProperty(global, 'TextDecoder', {
    value: class {
      decode(arr: Uint8Array) {
        return String.fromCharCode(...arr);
      }
    },
    writable: true
  });
});

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  mockLocalStorage.length = 0;
});

// Export mocks for direct use in tests
export {
  mockCrypto,
  mockLocalStorage,
  MockResponse
};

// Export test utilities
export function createMockStream(chunks: string[], options?: { delay?: number }) {
  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        if (options?.delay) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
        controller.enqueue(chunk);
      }
      controller.close();
    }
  });
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
} 