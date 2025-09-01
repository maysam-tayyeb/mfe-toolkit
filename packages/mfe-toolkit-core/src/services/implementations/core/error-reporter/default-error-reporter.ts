/**
 * Default Error Reporter Implementation
 * Reference implementation for error tracking and reporting in MFEs
 */

import type { ErrorReporter, ErrorReport, ErrorSummary } from '../../../../types/error-reporter';
import type { ServiceContainer } from '../../../../core/service-registry/types';

export interface ErrorReporterConfig {
  maxErrorsPerSession?: number;
  errorThrottleMs?: number;
  enableConsoleLog?: boolean;
  enableRemoteLogging?: boolean;
  remoteEndpoint?: string;
  onError?: (report: ErrorReport) => void;
}

export class DefaultErrorReporter implements ErrorReporter {
  private errors: ErrorReport[] = [];
  private errorCounts = new Map<string, number>();
  private lastErrorTime = new Map<string, number>();
  private config: Required<ErrorReporterConfig>;
  private services?: ServiceContainer;

  constructor(config: ErrorReporterConfig = {}, services?: ServiceContainer) {
    this.config = {
      maxErrorsPerSession: 100,
      errorThrottleMs: 5000,
      enableConsoleLog: true,
      enableRemoteLogging: false,
      remoteEndpoint: '',
      onError: () => {},
      ...config,
    };
    this.services = services;
  }

  reportError(
    mfeName: string,
    error: Error,
    type: ErrorReport['type'] = 'runtime-error',
    context?: ErrorReport['context'],
    errorInfo?: ErrorReport['errorInfo']
  ): ErrorReport | null {
    // Throttle similar errors
    const errorKey = `${mfeName}-${error.message}`;
    const lastTime = this.lastErrorTime.get(errorKey) || 0;
    const now = Date.now();

    if (now - lastTime < this.config.errorThrottleMs) {
      return null; // Throttled
    }

    this.lastErrorTime.set(errorKey, now);

    // Check max errors
    if (this.errors.length >= this.config.maxErrorsPerSession) {
      console.warn('Max error reports reached for session');
      return null;
    }

    // Create error report
    const report: ErrorReport = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      mfeName,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        sessionId: this.getSessionId(),
        userId: this.getUserId(),
        ...context,
      },
      errorInfo,
      severity: this.calculateSeverity(error, type),
      type,
    };

    // Store error
    this.errors.push(report);
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Log to console if enabled
    if (this.config.enableConsoleLog) {
      console.group(`🚨 MFE Error Report: ${mfeName}`);
      console.error('Error:', error);
      console.log('Report:', report);
      console.groupEnd();
    }

    // Log to MFE logger if available
    const logger = this.services?.get('logger');
    if (logger) {
      logger.error(`MFE Error in ${mfeName}: ${error.message}`, report);
    }

    // Send to remote if enabled
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.sendToRemote(report);
    }

    // Call custom handler
    this.config.onError(report);

    // Show notification for critical errors
    if (report.severity === 'critical') {
      this.showCriticalErrorNotification(mfeName);
    }

    return report;
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getErrorsByMFE(mfeName: string): ErrorReport[] {
    return this.errors.filter((e) => e.mfeName === mfeName);
  }

  getErrorCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.errorCounts.forEach((count, key) => {
      counts[key] = count;
    });
    return counts;
  }

  clearErrors(): void {
    this.errors = [];
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }

  getSummary(): ErrorSummary {
    const summary: ErrorSummary = {
      totalErrors: this.errors.length,
      errorsByType: {},
      errorsBySeverity: {},
      errorsByMFE: {},
    };

    this.errors.forEach((error) => {
      // By type
      summary.errorsByType[error.type] = (summary.errorsByType[error.type] || 0) + 1;

      // By severity
      summary.errorsBySeverity[error.severity] =
        (summary.errorsBySeverity[error.severity] || 0) + 1;

      // By MFE
      summary.errorsByMFE[error.mfeName] = (summary.errorsByMFE[error.mfeName] || 0) + 1;
    });

    return summary;
  }

  private calculateSeverity(error: Error, type: ErrorReport['type']): ErrorReport['severity'] {
    // Network errors are usually medium severity
    if (type === 'network-error') return 'medium';

    // Timeout errors are low severity (can retry)
    if (type === 'timeout-error') return 'low';

    // Load errors are high severity
    if (type === 'load-error') return 'high';

    // Runtime errors depend on the error type
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'critical';
    }

    return 'medium';
  }

  private getSessionId(): string {
    if (typeof sessionStorage === 'undefined') {
      return 'no-session';
    }
    
    let sessionId = sessionStorage.getItem('mfe-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem('mfe-session-id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    // Try to get auth service if available
    const auth = this.services?.get('auth' as any);
    if (auth && typeof (auth as any).getSession === 'function') {
      return (auth as any).getSession()?.userId;
    }
    return undefined;
  }

  private showCriticalErrorNotification(mfeName: string): void {
    // Try to get notification service if available
    const notification = this.services?.get('notification' as any);
    if (notification && typeof (notification as any).error === 'function') {
      (notification as any).error(
        'Critical Error',
        `${mfeName} encountered a critical error. Please refresh the page.`
      );
    } else {
      // Fallback to console error if notification service not available
      console.error(
        `Critical Error: ${mfeName} encountered a critical error. Please refresh the page.`
      );
    }
  }

  private async sendToRemote(report: ErrorReport): Promise<void> {
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send error report to remote:', error);
    }
  }
}

/**
 * Factory function for creating an error reporter
 * @param config - Optional configuration
 * @param services - Optional service container for integration
 * @returns ErrorReporter instance
 */
export function createErrorReporter(
  config?: ErrorReporterConfig,
  services?: ServiceContainer
): ErrorReporter {
  return new DefaultErrorReporter(config, services);
}

/**
 * Default error reporter instance
 */
export const defaultErrorReporter = createErrorReporter();