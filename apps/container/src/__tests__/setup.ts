// Test setup for container app
import '@testing-library/jest-dom';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock window.React and window.ReactDOM for MFE tests
Object.defineProperty(window, 'React', {
  writable: true,
  value: {},
});

Object.defineProperty(window, 'ReactDOM', {
  writable: true,
  value: {},
});

// Mock Redux store
Object.defineProperty(window, '__REDUX_STORE__', {
  writable: true,
  value: {
    getState: vi.fn(() => ({
      auth: { session: null },
      modal: { isOpen: false },
      notification: { notifications: [] },
    })),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
});
