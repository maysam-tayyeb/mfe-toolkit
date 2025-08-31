/**
 * Simple Event Bus Implementation
 * Reference implementation for MFE communication via pub/sub pattern
 */

import type { EventBus, EventPayload } from '../../services/registry/types';

export class SimpleEventBus implements EventBus {
  private handlers: Map<string, Set<(payload: EventPayload<any>) => void>> = new Map();
  private source: string;

  constructor(source: string = 'container') {
    this.source = source;
  }

  emit<T = any>(event: string, data: T): void {
    const payload: EventPayload<T> = {
      type: event,
      data,
      timestamp: Date.now(),
      source: this.source,
    };

    // Emit to specific event handlers
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Emit to wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in wildcard handler for ${event}:`, error);
        }
      });
    }
  }

  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    const handlers = this.handlers.get(event)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  off(event: string, handler: (payload: EventPayload<any>) => void): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  once<T = any>(event: string, handler: (payload: EventPayload<T>) => void): void {
    const onceHandler = (payload: EventPayload<T>) => {
      handler(payload);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /**
   * Clear all event handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get the number of handlers for an event
   */
  getHandlerCount(event: string): number {
    const handlers = this.handlers.get(event);
    return handlers ? handlers.size : 0;
  }

  /**
   * Get all registered events
   */
  getEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * Factory function for creating a simple event bus
 * @param source - Optional source identifier for events
 * @returns EventBus instance
 */
export function createSimpleEventBus(source?: string): EventBus {
  return new SimpleEventBus(source);
}

/**
 * Default event bus instance
 */
export const defaultEventBus = createSimpleEventBus('default');