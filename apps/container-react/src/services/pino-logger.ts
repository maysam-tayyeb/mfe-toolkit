/**
 * Pino Logger Implementation
 * 
 * Demonstrates how to override the default logger service with a custom implementation.
 * This uses the popular pino logger library for structured logging.
 */

import pino from 'pino';
import type { Logger } from '@mfe-toolkit/core';

/**
 * Pino-based Logger implementation
 */
export class PinoLogger implements Logger {
  private pino: pino.Logger;
  
  constructor(name: string = 'container', options?: pino.LoggerOptions) {
    this.pino = pino({
      name,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      browser: {
        serialize: true,
        asObject: true,
        transmit: {
          level: 'info',
          send: (level, logEvent) => {
            // In production, you could send logs to a remote service
            if (process.env.NODE_ENV === 'production') {
              // Example: Send to remote logging service
              // fetch('/api/logs', {
              //   method: 'POST',
              //   headers: { 'Content-Type': 'application/json' },
              //   body: JSON.stringify(logEvent)
              // });
            }
          }
        }
      },
      // Merge with custom options
      ...options
    });
  }
  
  debug(message: string, data?: unknown): void {
    if (data !== undefined) {
      this.pino.debug({ data }, message);
    } else {
      this.pino.debug(message);
    }
  }
  
  info(message: string, data?: unknown): void {
    if (data !== undefined) {
      this.pino.info({ data }, message);
    } else {
      this.pino.info(message);
    }
  }
  
  warn(message: string, data?: unknown): void {
    if (data !== undefined) {
      this.pino.warn({ data }, message);
    } else {
      this.pino.warn(message);
    }
  }
  
  error(message: string, data?: unknown): void {
    if (data !== undefined) {
      this.pino.error({ data }, message);
    } else {
      this.pino.error(message);
    }
  }
  
  /**
   * Get the underlying pino instance for advanced usage
   */
  getPino(): pino.Logger {
    return this.pino;
  }
}

/**
 * Factory function to create a PinoLogger
 */
export function createPinoLogger(name?: string, options?: pino.LoggerOptions): PinoLogger {
  return new PinoLogger(name, options);
}

/**
 * Example of creating a child logger for specific contexts
 */
export function createChildLogger(parent: PinoLogger, context: Record<string, unknown>): PinoLogger {
  const childPino = parent.getPino().child(context);
  const childLogger = new PinoLogger();
  // Replace the internal pino instance
  (childLogger as any).pino = childPino;
  return childLogger;
}