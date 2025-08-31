/**
 * Console Logger Implementation
 * Default logger implementation using browser console
 */

import type { Logger } from '@mfe-toolkit/core';

export class ConsoleLogger implements Logger {
  constructor(private prefix: string) {}

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
 */
export function createConsoleLogger(prefix: string): Logger {
  return new ConsoleLogger(prefix);
}