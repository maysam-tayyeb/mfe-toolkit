/**
 * Console Logger Implementation
 * Reference implementation of the Logger interface using browser console
 */

import type { Logger } from '../../../types/logger';

export class ConsoleLogger implements Logger {
  constructor(private prefix: string = 'MFE') {}

  private formatMessage(level: string, message: string): string {
    return `[${new Date().toISOString()}] [${this.prefix}] [${level}] ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    console.debug(this.formatMessage('DEBUG', message), ...args);
  }

  info(message: string, ...args: any[]): void {
    console.info(this.formatMessage('INFO', message), ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message), ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message), ...args);
  }
}

/**
 * Factory function for creating a console logger
 * @param prefix - Optional prefix for log messages
 * @returns Logger instance
 */
export function createConsoleLogger(prefix?: string): Logger {
  return new ConsoleLogger(prefix);
}

/**
 * Default logger instance
 */
export const defaultLogger = createConsoleLogger('Default');