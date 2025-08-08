import { MFEServices } from '../types';

interface ErrorReporterConfig {
  logToConsole?: boolean;
  sendToService?: boolean;
}

export function getErrorReporter(config: ErrorReporterConfig, services: MFEServices) {
  return {
    reportError: (
      mfeName: string,
      error: Error,
      errorType: string,
      metadata?: Record<string, any>
    ) => {
      const errorInfo = {
        mfeName,
        errorType,
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
        metadata,
      };

      if (config.logToConsole !== false) {
        console.error(`[ErrorReporter] ${mfeName}:`, errorInfo);
      }

      // Log using the logger service
      services.logger.error(`MFE Error in ${mfeName}: ${error.message}`, errorInfo);

      // You could also send to a remote error tracking service here
      if (config.sendToService) {
        // Example: sendToErrorTrackingService(errorInfo);
      }
    },
  };
}
