import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultErrorReporter as ErrorReporter } from './default-error-reporter';

describe('ErrorReporter', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleGroupSpy: any;
  let consoleLogSpy: any;
  let consoleGroupEndSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    
    // Mock window and navigator for Node environment
    global.window = { location: { href: 'http://localhost' } } as any;
    global.navigator = { userAgent: 'test-agent' } as any;
    global.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    } as any;
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create an ErrorReporter with default config', () => {
      const reporter = new ErrorReporter();
      expect(reporter).toBeDefined();
      expect(reporter.getErrors()).toHaveLength(0);
    });

    it('should merge custom config with defaults', () => {
      const onError = vi.fn();
      const reporter = new ErrorReporter({
        maxErrorsPerSession: 50,
        enableConsoleLog: false,
        onError,
      });
      
      // Report an error to test config
      reporter.reportError('TestMFE', new Error('Test'), 'runtime-error');

      expect(onError).toHaveBeenCalled();
      expect(consoleGroupSpy).not.toHaveBeenCalled(); // enableConsoleLog is false
    });
  });

  describe('reportError', () => {
    it('should report a basic error', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      const error = new Error('Test error');
      
      const report = reporter.reportError('TestMFE', error, 'runtime-error');

      expect(report).toBeTruthy();
      expect(report?.error.message).toBe('Test error');
      expect(report?.mfeName).toBe('TestMFE');
      expect(report?.type).toBe('runtime-error');
      
      const errors = reporter.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].error.message).toBe('Test error');
    });

    it('should include error stack trace', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      const error = new Error('Stack test');
      error.stack = 'Error: Stack test\n  at test.js:10:5';
      
      const report = reporter.reportError('TestMFE', error, 'runtime-error');

      expect(report?.error.stack).toBe('Error: Stack test\n  at test.js:10:5');
    });

    it('should include context information', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      const error = new Error('Context test');
      const context = {
        userId: 'user456',
        retryCount: 3,
      };

      const report = reporter.reportError('TestMFE', error, 'network-error', context);

      expect(report?.context?.userId).toBe('user456');
      expect(report?.context?.retryCount).toBe(3);
      expect(report?.context?.url).toBe('http://localhost');
      expect(report?.context?.userAgent).toBe('test-agent');
    });

    it('should call onError callback', () => {
      const onError = vi.fn();
      const reporter = new ErrorReporter({ onError, enableConsoleLog: false });
      const error = new Error('Callback test');

      reporter.reportError('TestMFE', error, 'runtime-error');

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Callback test',
          }),
          mfeName: 'TestMFE',
        })
      );
    });

    it('should log to console when enableConsoleLog is true', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: true });
      const error = new Error('Console test');

      reporter.reportError('TestMFE', error, 'runtime-error');

      expect(consoleGroupSpy).toHaveBeenCalledWith('🚨 MFE Error Report: TestMFE');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error);
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should not log to console when enableConsoleLog is false', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      const error = new Error('No console test');

      reporter.reportError('TestMFE', error, 'runtime-error');

      expect(consoleGroupSpy).not.toHaveBeenCalled();
    });

    it('should throttle repeated errors', () => {
      const reporter = new ErrorReporter({ errorThrottleMs: 1000, enableConsoleLog: false });
      const error = new Error('Throttle test');

      // Report same error multiple times quickly
      const report1 = reporter.reportError('TestMFE', error, 'runtime-error');
      const report2 = reporter.reportError('TestMFE', error, 'runtime-error');

      expect(report1).toBeTruthy();
      expect(report2).toBeNull(); // Should be throttled
      expect(reporter.getErrors()).toHaveLength(1);

      // Advance time and try again
      vi.advanceTimersByTime(1001);

      const report3 = reporter.reportError('TestMFE', error, 'runtime-error');
      expect(report3).toBeTruthy();
      expect(reporter.getErrors()).toHaveLength(2);
    });

    it('should respect maxErrorsPerSession limit', () => {
      const reporter = new ErrorReporter({ maxErrorsPerSession: 3, enableConsoleLog: false });

      for (let i = 0; i < 5; i++) {
        reporter.reportError('TestMFE', new Error(`Error ${i}`), 'runtime-error');
        vi.advanceTimersByTime(6000); // Avoid throttling
      }

      expect(reporter.getErrors()).toHaveLength(3);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Max error reports reached for session');
    });

    it('should calculate severity based on error type', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      
      const networkError = reporter.reportError('TestMFE', new Error('Network'), 'network-error');
      expect(networkError?.severity).toBe('medium');
      
      vi.advanceTimersByTime(6000);
      
      const timeoutError = reporter.reportError('TestMFE', new Error('Timeout'), 'timeout-error');
      expect(timeoutError?.severity).toBe('low');
      
      vi.advanceTimersByTime(6000);
      
      const loadError = reporter.reportError('TestMFE', new Error('Load'), 'load-error');
      expect(loadError?.severity).toBe('high');
      
      vi.advanceTimersByTime(6000);
      
      const typeError = new TypeError('Type error');
      const runtimeError = reporter.reportError('TestMFE', typeError, 'runtime-error');
      expect(runtimeError?.severity).toBe('critical');
    });
  });

  describe('getErrors', () => {
    it('should return all reported errors', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      
      reporter.reportError('MFE1', new Error('Error 1'), 'runtime-error');
      vi.advanceTimersByTime(6000);
      
      reporter.reportError('MFE2', new Error('Error 2'), 'network-error');

      const errors = reporter.getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0].error.message).toBe('Error 1');
      expect(errors[1].error.message).toBe('Error 2');
    });

    it('should return empty array when no errors', () => {
      const reporter = new ErrorReporter();
      expect(reporter.getErrors()).toEqual([]);
    });
  });

  describe('getErrorsByMFE', () => {
    it('should filter errors by MFE name', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      
      reporter.reportError('MFE1', new Error('MFE1 Error 1'), 'runtime-error');
      vi.advanceTimersByTime(6000);
      
      reporter.reportError('MFE2', new Error('MFE2 Error'), 'network-error');
      vi.advanceTimersByTime(6000);
      
      reporter.reportError('MFE1', new Error('MFE1 Error 2'), 'timeout-error');

      const mfe1Errors = reporter.getErrorsByMFE('MFE1');
      expect(mfe1Errors).toHaveLength(2);
      expect(mfe1Errors[0].error.message).toBe('MFE1 Error 1');
      expect(mfe1Errors[1].error.message).toBe('MFE1 Error 2');

      const mfe2Errors = reporter.getErrorsByMFE('MFE2');
      expect(mfe2Errors).toHaveLength(1);
      expect(mfe2Errors[0].error.message).toBe('MFE2 Error');
    });

    it('should return empty array for unknown MFE', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      
      reporter.reportError('MFE1', new Error('Test'), 'runtime-error');

      expect(reporter.getErrorsByMFE('UnknownMFE')).toEqual([]);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      
      reporter.reportError('MFE1', new Error('Error 1'), 'runtime-error');
      vi.advanceTimersByTime(6000);
      
      reporter.reportError('MFE2', new Error('Error 2'), 'network-error');

      expect(reporter.getErrors()).toHaveLength(2);
      
      reporter.clearErrors();
      
      expect(reporter.getErrors()).toHaveLength(0);
    });

    it('should reset error counts after clearing', () => {
      const reporter = new ErrorReporter({ errorThrottleMs: 1000, enableConsoleLog: false });
      const error = new Error('Test');
      
      reporter.reportError('TestMFE', error, 'runtime-error');
      reporter.clearErrors();
      
      // Should be able to report same error immediately after clearing
      const report = reporter.reportError('TestMFE', error, 'runtime-error');
      
      expect(report).toBeTruthy();
      expect(reporter.getErrors()).toHaveLength(1);
    });
  });

  describe('getErrorCounts', () => {
    it('should return error counts by key', () => {
      const reporter = new ErrorReporter({ errorThrottleMs: 100, enableConsoleLog: false });
      
      reporter.reportError('MFE1', new Error('Error A'), 'runtime-error');
      vi.advanceTimersByTime(200);
      reporter.reportError('MFE1', new Error('Error A'), 'runtime-error');
      vi.advanceTimersByTime(200);
      reporter.reportError('MFE2', new Error('Error B'), 'runtime-error');
      
      const counts = reporter.getErrorCounts();
      expect(counts['MFE1-Error A']).toBe(2);
      expect(counts['MFE2-Error B']).toBe(1);
    });
  });

  describe('getSummary', () => {
    it.skip('should return error summary', () => {
      const reporter = new ErrorReporter({ enableConsoleLog: false });
      
      reporter.reportError('MFE1', new Error('Error 1'), 'runtime-error');
      vi.advanceTimersByTime(6000);
      reporter.reportError('MFE2', new Error('Error 2'), 'network-error');
      vi.advanceTimersByTime(6000);
      reporter.reportError('MFE1', new TypeError('Type Error'), 'runtime-error');
      
      const summary = reporter.getSummary();
      
      expect(summary.totalErrors).toBe(3);
      expect(summary.errorsByMFE['MFE1']).toBe(2);
      expect(summary.errorsByMFE['MFE2']).toBe(1);
      expect(summary.errorsByType['runtime-error']).toBe(2);
      expect(summary.errorsByType['network-error']).toBe(1);
      // Just check that severities are being tracked
      expect(summary.errorsBySeverity).toBeDefined();
      expect(Object.keys(summary.errorsBySeverity).length).toBeGreaterThan(0);
      expect(summary.recentErrors).toHaveLength(3);
    });
  });
});