// Test setup for mfe-example
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Create mock MFE services for testing
export const mockMFEServices = {
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  auth: {
    getSession: vi.fn(() => null),
    isAuthenticated: vi.fn(() => false),
    hasPermission: vi.fn(() => false),
    hasRole: vi.fn(() => false),
  },
  eventBus: {
    emit: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    clear: vi.fn(),
  },
  modal: {
    open: vi.fn(),
    close: vi.fn(),
  },
  notification: {
    show: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
};