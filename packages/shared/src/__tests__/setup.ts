// Test setup for shared package
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};
