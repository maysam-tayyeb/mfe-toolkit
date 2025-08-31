/**
 * Error Reporter Types
 * Interface definitions for error reporting service
 */

export interface ErrorReport {
  id: string;
  timestamp: Date;
  mfeName: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context?: {
    url?: string;
    userAgent?: string;
    sessionId?: string;
    userId?: string;
    retryCount?: number;
  };
  errorInfo?: {
    componentStack?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'load-error' | 'runtime-error' | 'network-error' | 'timeout-error';
}

export interface ErrorSummary {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByMFE: Record<string, number>;
}

export interface ErrorReporter {
  /**
   * Report an error
   */
  reportError(
    mfeName: string,
    error: Error,
    type?: ErrorReport['type'],
    context?: ErrorReport['context'],
    errorInfo?: ErrorReport['errorInfo']
  ): ErrorReport | null;

  /**
   * Get all reported errors
   */
  getErrors(): ErrorReport[];

  /**
   * Get errors for a specific MFE
   */
  getErrorsByMFE(mfeName: string): ErrorReport[];

  /**
   * Get error counts
   */
  getErrorCounts(): Record<string, number>;

  /**
   * Clear all errors
   */
  clearErrors(): void;

  /**
   * Get error summary statistics
   */
  getSummary(): ErrorSummary;
}