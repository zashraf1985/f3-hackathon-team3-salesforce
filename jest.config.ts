import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    'agentdock-core/src/**/*.ts',
    '!src/**/*.d.ts',
    '!agentdock-core/src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!agentdock-core/src/**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^agentdock-core/(.*)$': '<rootDir>/agentdock-core/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/agentdock-core/src/test/setup.ts']
};

export default config; 