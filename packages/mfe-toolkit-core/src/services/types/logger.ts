/**
 * Logger Service Interface
 * 
 * Provides logging capabilities for MFEs and containers.
 * Implementations can vary from simple console logging to
 * advanced logging solutions like Pino or Winston.
 */

/**
 * Logger service interface for structured logging
 */
export interface Logger {
  /**
   * Log debug level messages (detailed information for debugging)
   */
  debug(message: string, ...args: any[]): void;

  /**
   * Log info level messages (general informational messages)
   */
  info(message: string, ...args: any[]): void;

  /**
   * Log warning level messages (potentially harmful situations)
   */
  warn(message: string, ...args: any[]): void;

  /**
   * Log error level messages (error events)
   */
  error(message: string, ...args: any[]): void;
}

/**
 * Service key for logger in the service registry
 */
export const LOGGER_SERVICE_KEY = 'logger';