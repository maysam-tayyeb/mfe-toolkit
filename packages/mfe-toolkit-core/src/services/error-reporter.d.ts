import { MFEServices } from '../types';
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
export interface ErrorReporterConfig {
    maxErrorsPerSession?: number;
    errorThrottleMs?: number;
    enableConsoleLog?: boolean;
    enableRemoteLogging?: boolean;
    remoteEndpoint?: string;
    onError?: (report: ErrorReport) => void;
}
export declare class ErrorReporter {
    private errors;
    private errorCounts;
    private lastErrorTime;
    private config;
    private services?;
    constructor(config?: ErrorReporterConfig, services?: MFEServices);
    reportError(mfeName: string, error: Error, type?: ErrorReport['type'], context?: ErrorReport['context'], errorInfo?: ErrorReport['errorInfo']): ErrorReport | null;
    private calculateSeverity;
    private getSessionId;
    private sendToRemote;
    getErrors(): ErrorReport[];
    getErrorsByMFE(mfeName: string): ErrorReport[];
    getErrorCounts(): Record<string, number>;
    clearErrors(): void;
    getSummary(): {
        totalErrors: number;
        errorsByType: Record<string, number>;
        errorsBySeverity: Record<string, number>;
        errorsByMFE: Record<string, number>;
    };
}
export declare function getErrorReporter(config?: ErrorReporterConfig, services?: MFEServices): ErrorReporter;
//# sourceMappingURL=error-reporter.d.ts.map