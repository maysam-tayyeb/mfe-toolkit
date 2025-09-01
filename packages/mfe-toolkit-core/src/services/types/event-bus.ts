/**
 * Event Bus Service Interface
 *
 * Provides pub/sub messaging capabilities for inter-MFE communication.
 * Enables decoupled communication between MFEs and the container.
 * Uses BaseEvent as the standard event format for type safety and consistency.
 */

import type { BaseEvent, MFEEventMap, EventType, TypedEvent, MFEEvents } from '../../domain/events';

/**
 * Event Bus interface with unified methods
 * Single API surface with intelligent overloads for maximum flexibility
 */
export interface EventBus {
  /**
   * Emit an event - supports multiple signatures for flexibility
   */
  // Typed event with MFEEventMap
  emit<K extends keyof MFEEventMap>(type: K, data: MFEEventMap[K]): void;
  // Legacy string event with optional data
  emit<T = any>(type: string, data?: T): void;
  // Complete BaseEvent object
  emit<T extends BaseEvent>(event: T): void;

  /**
   * Subscribe to events - returns unsubscribe function
   */
  // Typed subscription with MFEEventMap
  on<K extends keyof MFEEventMap>(
    type: K,
    handler: (event: TypedEvent<MFEEventMap, K>) => void
  ): () => void;
  // Legacy string subscription
  on<T = any>(type: string, handler: (event: BaseEvent<string, T>) => void): () => void;

  /**
   * Subscribe once - auto-unsubscribe after first event
   */
  // Typed once with MFEEventMap
  once<K extends keyof MFEEventMap>(
    type: K,
    handler: (event: TypedEvent<MFEEventMap, K>) => void
  ): () => void;
  // Legacy string once
  once<T = any>(type: string, handler: (event: BaseEvent<string, T>) => void): () => void;

  /**
   * Unsubscribe from events
   */
  // Typed unsubscribe
  off<K extends keyof MFEEventMap>(
    type: K,
    handler: (event: TypedEvent<MFEEventMap, K>) => void
  ): void;
  // Legacy string unsubscribe
  off<T = any>(type: string, handler: (event: BaseEvent<string, T>) => void): void;

  /**
   * Remove all listeners for an event type, or all if no type specified
   */
  removeAllListeners(type?: string): void;

  /**
   * Get the count of listeners for an event type
   */
  listenerCount(type: string): number;

  /**
   * Get all registered event types
   */
  getEventTypes(): string[];

  // ============================================================================
  // Debugging Features
  // ============================================================================

  /**
   * Enable/disable event logging to console
   */
  enableLogging(enabled: boolean): void;

  /**
   * Get event history (last N events)
   * Useful for debugging and testing
   */
  getEventHistory(limit?: number): BaseEvent[];

  /**
   * Clear event history
   */
  clearEventHistory(): void;

  /**
   * Enable/disable event validation in development
   */
  enableValidation(enabled: boolean): void;

  /**
   * Get statistics about event usage
   */
  getEventStats(): {
    totalEmitted: number;
    totalHandlers: number;
    eventCounts: Record<string, number>;
    handlerCounts: Record<string, number>;
  };
}

/**
 * Service key for event bus in the service registry
 */
export const EVENT_BUS_SERVICE_KEY = 'eventBus';

/**
 * Event handler that accepts BaseEvent format
 */
export type EventHandler<T = any> = (event: BaseEvent<string, T>) => void;

/**
 * Type-safe event handler for domain events
 */
export type TypedEventHandler<
  TEventMap extends Record<string, unknown>,
  TType extends EventType<TEventMap>,
> = (event: TypedEvent<TEventMap, TType>) => void;

/**
 * Type guard to check if an object is a BaseEvent
 */
export function isBaseEvent(event: unknown): event is BaseEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    'timestamp' in event &&
    'source' in event
  );
}

/**
 * Migration helper to convert legacy EventBus to new EventBus
 * Provides backward compatibility during transition
 */
export class EventBusAdapter implements EventBus {
  constructor(private legacyBus: any) {}

  emit(...args: any[]): void {
    if (args.length === 1 && typeof args[0] === 'object' && 'type' in args[0]) {
      // BaseEvent object
      this.legacyBus.emitEvent(args[0]);
    } else {
      // Legacy emit(type, data?)
      this.legacyBus.emit(args[0], args[1]);
    }
  }

  on(...args: any[]): () => void {
    const [type, handler] = args;
    return this.legacyBus.on(type, handler);
  }

  once(...args: any[]): () => void {
    const [type, handler] = args;
    return this.legacyBus.once(type, handler);
  }

  off(...args: any[]): void {
    const [type, handler] = args;
    this.legacyBus.off(type, handler);
  }

  removeAllListeners(type?: string): void {
    this.legacyBus.removeAllListeners?.(type);
  }

  listenerCount(type: string): number {
    return this.legacyBus.listenerCount?.(type) || 0;
  }

  getEventTypes(): string[] {
    return this.legacyBus.getEvents?.() || [];
  }

  enableLogging(enabled: boolean): void {
    // To be implemented
    console.log(`Event logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  getEventHistory(limit?: number): BaseEvent[] {
    // To be implemented
    return [];
  }

  clearEventHistory(): void {
    // To be implemented
  }

  enableValidation(enabled: boolean): void {
    // To be implemented
    console.log(`Event validation ${enabled ? 'enabled' : 'disabled'}`);
  }

  getEventStats() {
    return {
      totalEmitted: 0,
      totalHandlers: this.listenerCount('*'),
      eventCounts: {},
      handlerCounts: {},
    };
  }
}

/**
 * Type-safe event emitter helper
 * Provides strongly-typed emit methods for common events
 */
export class TypedEventEmitter {
  constructor(private eventBus: EventBus) {}

  // MFE Lifecycle
  emitMFELoaded(name: string, version: string, metadata?: Record<string, unknown>): void {
    this.eventBus.emit('mfe:loaded', { name, version, metadata });
  }

  emitMFEReady(name: string, capabilities?: string[]): void {
    this.eventBus.emit('mfe:ready', { name, capabilities });
  }

  emitMFEError(
    name: string,
    error: string,
    stack?: string,
    context?: Record<string, unknown>
  ): void {
    this.eventBus.emit('mfe:error', { name, error, stack, context });
  }

  // Navigation
  emitNavigationChange(
    from: string,
    to: string,
    method: 'push' | 'replace' | 'back' | 'forward' = 'push'
  ): void {
    this.eventBus.emit('navigation:change', { from, to, method });
  }

  // User Events
  emitUserLogin(userId: string, username: string, roles: string[]): void {
    this.eventBus.emit('user:login', { userId, username, roles });
  }

  emitUserLogout(userId: string, reason?: string): void {
    this.eventBus.emit('user:logout', { userId, reason });
  }

  // Add more typed methods as needed...
}

/**
 * Event validation schemas for development mode
 */
export const EventValidators = {
  'mfe:loaded': (data: any): boolean => {
    return typeof data?.name === 'string' && typeof data?.version === 'string';
  },
  'mfe:ready': (data: any): boolean => {
    return typeof data?.name === 'string';
  },
  'mfe:error': (data: any): boolean => {
    return typeof data?.name === 'string' && typeof data?.error === 'string';
  },
  'navigation:change': (data: any): boolean => {
    return typeof data?.from === 'string' && typeof data?.to === 'string';
  },
  'user:login': (data: any): boolean => {
    return (
      typeof data?.userId === 'string' &&
      typeof data?.username === 'string' &&
      Array.isArray(data?.roles)
    );
  },
  // Add more validators as needed...
};
