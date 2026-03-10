/**
 * Jest Test Setup
 *
 * Global test configuration and setup for the LeoRAG system.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

// Set test environment
process.env['NODE_ENV'] = 'test';

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output in tests unless explicitly needed
  if (!process.env['VERBOSE_TESTS']) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  if (!process.env['VERBOSE_TESTS']) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});

// Global test utilities
export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

// Custom Jest matchers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
expect.extend({
  // eslint-disable-next-line no-unused-vars
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
