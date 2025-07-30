import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Ensure we're using happy-dom
if (!globalThis.document) {
  throw new Error('happy-dom is not loaded. Check vitest config.');
}

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: vi.fn(console.error),
  warn: vi.fn(console.warn),
  log: vi.fn(console.log),
  info: vi.fn(console.info),
  debug: vi.fn(console.debug),
};