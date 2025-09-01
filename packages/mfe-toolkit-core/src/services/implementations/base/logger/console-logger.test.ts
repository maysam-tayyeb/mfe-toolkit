import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createConsoleLogger as createLogger } from './console-logger';

describe('Logger', () => {
  let originalConsole: typeof console;

  beforeEach(() => {
    // Save original console methods
    originalConsole = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    } as typeof console;

    // Mock console methods
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    // Mock Date.prototype.toISOString to return a consistent value
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    vi.useRealTimers();
  });

  describe('createLogger', () => {
    it('should create a logger with the given prefix', () => {
      const logger = createLogger('TestMFE');
      expect(logger).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should format and log debug messages correctly', () => {
      const logger = createLogger('TestMFE');
      logger.debug('Test debug message');

      expect(console.debug).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [DEBUG] Test debug message'
      );
    });

    it('should format and log info messages correctly', () => {
      const logger = createLogger('TestMFE');
      logger.info('Test info message');

      expect(console.info).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [INFO] Test info message'
      );
    });

    it('should format and log warn messages correctly', () => {
      const logger = createLogger('TestMFE');
      logger.warn('Test warning message');

      expect(console.warn).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [WARN] Test warning message'
      );
    });

    it('should format and log error messages correctly', () => {
      const logger = createLogger('TestMFE');
      logger.error('Test error message');

      expect(console.error).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [ERROR] Test error message'
      );
    });

    it('should pass additional arguments to console methods', () => {
      const logger = createLogger('TestMFE');
      const additionalData = { foo: 'bar' };
      const error = new Error('Test error');

      logger.debug('Debug with data', additionalData);
      logger.info('Info with data', additionalData);
      logger.warn('Warning with data', additionalData);
      logger.error('Error with object', error);

      expect(console.debug).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [DEBUG] Debug with data',
        additionalData
      );
      expect(console.info).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [INFO] Info with data',
        additionalData
      );
      expect(console.warn).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [WARN] Warning with data',
        additionalData
      );
      expect(console.error).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [ERROR] Error with object',
        error
      );
    });

    it('should handle multiple arguments correctly', () => {
      const logger = createLogger('TestMFE');
      const arg1 = { key: 'value' };
      const arg2 = [1, 2, 3];
      const arg3 = 'additional string';

      logger.info('Multiple args', arg1, arg2, arg3);

      expect(console.info).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [TestMFE] [INFO] Multiple args',
        arg1,
        arg2,
        arg3
      );
    });

    it('should use different prefixes for different logger instances', () => {
      const logger1 = createLogger('MFE1');
      const logger2 = createLogger('MFE2');

      logger1.info('Message from MFE1');
      logger2.info('Message from MFE2');

      expect(console.info).toHaveBeenNthCalledWith(
        1,
        '[2024-01-01T12:00:00.000Z] [MFE1] [INFO] Message from MFE1'
      );
      expect(console.info).toHaveBeenNthCalledWith(
        2,
        '[2024-01-01T12:00:00.000Z] [MFE2] [INFO] Message from MFE2'
      );
    });

    it('should handle empty prefix', () => {
      const logger = createLogger('');
      logger.info('Message with empty prefix');

      expect(console.info).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [] [INFO] Message with empty prefix'
      );
    });

    it('should handle special characters in prefix', () => {
      const logger = createLogger('@mfe/special-chars-123');
      logger.info('Message with special chars');

      expect(console.info).toHaveBeenCalledWith(
        '[2024-01-01T12:00:00.000Z] [@mfe/special-chars-123] [INFO] Message with special chars'
      );
    });
  });
});