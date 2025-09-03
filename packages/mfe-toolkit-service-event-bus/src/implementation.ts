/**
 * Simple Event Bus Implementation
 * 
 * Clean, unified implementation with single internal format and debugging features.
 */

import type { EventBus, EventPayload, EventHandler, EventBusConfig } from './types';

type InternalHandler = (event: EventPayload) => void;

export class SimpleEventBus implements EventBus {
  private handlers = new Map<string, Set<InternalHandler>>();
  private eventHistory: EventPayload[] = [];
  private loggingEnabled = false;
  private validationEnabled = false;
  private source: string;
  private stats = {
    totalEmitted: 0,
    eventCounts: {} as Record<string, number>,
  };
  private maxHistorySize: number;
  private logger?: EventBusConfig['logger'];

  constructor(source: string = 'container', config?: EventBusConfig) {
    this.source = source;
    this.maxHistorySize = config?.maxHistorySize || 100;
    this.loggingEnabled = config?.debug || false;
    this.validationEnabled = config?.enableValidation || false;
    this.logger = config?.logger;
    
    // Enable validation in development by default
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      this.validationEnabled = true;
    }
  }

  /**
   * Unified emit method with overload support
   */
  emit(...args: any[]): void {
    const event = this.normalizeToEventPayload(args);
    
    // Validation in development
    if (this.validationEnabled) {
      this.validateEvent(event);
    }
    
    // Logging
    if (this.loggingEnabled && this.logger) {
      this.logger.debug(`[EventBus] ${event.type}`, event);
    }
    
    // Update statistics
    this.updateStats(event);
    
    // Store in history
    this.addToHistory(event);
    
    // Dispatch to handlers
    this.dispatch(event);
  }

  /**
   * Convert various emit signatures to EventPayload
   */
  private normalizeToEventPayload(args: any[]): EventPayload {
    // Case 1: Single EventPayload object
    if (args.length === 1 && typeof args[0] === 'object' && 'type' in args[0] && 'timestamp' in args[0]) {
      return {
        ...args[0],
        source: args[0].source || this.source,
      };
    }
    
    // Case 2: Type and data
    if (args.length >= 1 && typeof args[0] === 'string') {
      return {
        type: args[0],
        data: args[1],
        timestamp: Date.now(),
        source: this.source,
      };
    }
    
    throw new Error(`Invalid emit arguments: ${JSON.stringify(args)}`);
  }

  /**
   * Subscribe to events
   */
  on<T = any>(type: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    // Wrap the handler to ensure it receives EventPayload
    const wrappedHandler: InternalHandler = (event: EventPayload) => {
      handler(event);
    };
    
    // Store the original handler reference for removal
    (wrappedHandler as any).__original = handler;
    
    this.handlers.get(type)!.add(wrappedHandler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(wrappedHandler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe once - auto-unsubscribe after first event
   */
  once<T = any>(type: string, handler: EventHandler<T>): () => void {
    const unsubscribe = this.on(type, (event: EventPayload<T>) => {
      handler(event);
      unsubscribe();
    });
    
    return unsubscribe;
  }

  /**
   * Unsubscribe from events
   */
  off<T = any>(type: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(type);
    
    if (handlers) {
      // Find and remove the wrapped handler with matching original
      const toRemove: InternalHandler[] = [];
      handlers.forEach(h => {
        if ((h as any).__original === handler) {
          toRemove.push(h);
        }
      });
      
      toRemove.forEach(h => handlers.delete(h));
      
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    }
  }

  /**
   * Remove all listeners for a type or all types
   */
  removeAllListeners(type?: string): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get listener count for a type
   */
  listenerCount(type: string): number {
    return this.handlers.get(type)?.size || 0;
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  // ============================================================================
  // Debugging Features
  // ============================================================================

  /**
   * Enable/disable event logging
   */
  enableLogging(enabled: boolean): void {
    this.loggingEnabled = enabled;
    if (enabled && this.logger) {
      this.logger.info('[EventBus] Logging enabled');
    }
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): EventPayload[] {
    if (!limit) {
      return [...this.eventHistory];
    }
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable/disable validation
   */
  enableValidation(enabled: boolean): void {
    this.validationEnabled = enabled;
    if (enabled && this.logger) {
      this.logger.info('[EventBus] Validation enabled');
    }
  }

  /**
   * Get event statistics
   */
  getEventStats() {
    const handlerCounts: Record<string, number> = {};
    this.handlers.forEach((handlers, type) => {
      handlerCounts[type] = handlers.size;
    });
    
    return {
      totalEmitted: this.stats.totalEmitted,
      totalHandlers: Array.from(this.handlers.values()).reduce((sum, set) => sum + set.size, 0),
      eventCounts: { ...this.stats.eventCounts },
      handlerCounts,
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Dispatch event to handlers
   */
  private dispatch(event: EventPayload): void {
    // Dispatch to specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          if (this.logger) {
            this.logger.error(`[EventBus] Error in handler for ${event.type}:`, error);
          }
        }
      });
    }
    
    // Dispatch to wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          if (this.logger) {
            this.logger.error(`[EventBus] Error in wildcard handler for ${event.type}:`, error);
          }
        }
      });
    }
  }

  /**
   * Validate event structure in development
   */
  private validateEvent(event: EventPayload): void {
    // Basic structure validation
    if (!event.type || typeof event.type !== 'string') {
      if (this.logger) {
        this.logger.warn('[EventBus] Invalid event: missing or invalid type', event);
      }
    }
    
    if (!event.timestamp || typeof event.timestamp !== 'number') {
      if (this.logger) {
        this.logger.warn('[EventBus] Invalid event: missing or invalid timestamp', event);
      }
    }
    
    if (!event.source || typeof event.source !== 'string') {
      if (this.logger) {
        this.logger.warn('[EventBus] Invalid event: missing or invalid source', event);
      }
    }
  }

  /**
   * Add event to history
   */
  private addToHistory(event: EventPayload): void {
    this.eventHistory.push(event);
    
    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Update event statistics
   */
  private updateStats(event: EventPayload): void {
    this.stats.totalEmitted++;
    this.stats.eventCounts[event.type] = (this.stats.eventCounts[event.type] || 0) + 1;
  }
}

/**
 * Factory function for creating a simple event bus
 */
export function createEventBus(source?: string, config?: EventBusConfig): EventBus {
  return new SimpleEventBus(source, config);
}

/**
 * Default event bus instance (for backward compatibility)
 */
export const defaultEventBus = createEventBus('default');