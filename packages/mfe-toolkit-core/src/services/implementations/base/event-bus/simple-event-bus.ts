/**
 * Simple Event Bus Implementation
 * Reference implementation for MFE communication via pub/sub pattern
 * Supports both legacy EventPayload and domain BaseEvent types
 */

import type { 
  EventBus, 
  EventPayload, 
  EventHandler,
  TypedEventHandler,
  AnyEvent
} from '../../../../services/types/event-bus';
import { isBaseEvent } from '../../../../services/types/event-bus';
import type { BaseEvent, EventType, TypedEvent, MFEEventMap } from '../../../../domain/events';

export class SimpleEventBus implements EventBus {
  private handlers: Map<string, Set<EventHandler<any>>> = new Map();
  private source: string;

  constructor(source: string = 'container') {
    this.source = source;
  }

  /**
   * Emit an event with data (legacy method)
   */
  emit<T = any>(event: string, data?: T): void {
    const payload: EventPayload<T> = {
      type: event,
      data,
      timestamp: Date.now(),
      source: this.source,
    };

    this.dispatchEvent(event, payload);
  }

  /**
   * Emit a complete domain event
   */
  emitEvent<T extends BaseEvent>(event: T): void {
    // Ensure the event has a source
    const eventWithSource = {
      ...event,
      source: event.source || this.source,
      timestamp: event.timestamp || Date.now(),
    };

    this.dispatchEvent(event.type, eventWithSource);
  }

  /**
   * Internal method to dispatch events to handlers
   */
  private dispatchEvent(eventType: string, event: AnyEvent): void {
    // Dispatch to specific event handlers
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
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
          console.error(`Error in wildcard handler for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event (supports both formats)
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
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

  /**
   * Subscribe to a typed domain event
   */
  onEvent<
    TEventMap extends Record<string, unknown> = MFEEventMap,
    TType extends EventType<TEventMap> = EventType<TEventMap>
  >(
    eventType: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): () => void {
    // Wrap the typed handler to work with the generic handler
    const wrappedHandler: EventHandler = (event: AnyEvent) => {
      // Only call the handler if it's the right event type
      if (isBaseEvent(event) && event.type === eventType) {
        handler(event as TypedEvent<TEventMap, TType>);
      }
    };

    return this.on(eventType as string, wrappedHandler);
  }

  /**
   * Subscribe to an event once
   */
  once<T = any>(event: string, handler: EventHandler<T>): () => void {
    const onceHandler: EventHandler<T> = (payload: AnyEvent<T>) => {
      handler(payload);
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler);
  }

  /**
   * Subscribe to a typed domain event once
   */
  onceEvent<
    TEventMap extends Record<string, unknown> = MFEEventMap,
    TType extends EventType<TEventMap> = EventType<TEventMap>
  >(
    eventType: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): () => void {
    const wrappedHandler: EventHandler = (event: AnyEvent) => {
      if (isBaseEvent(event) && event.type === eventType) {
        handler(event as TypedEvent<TEventMap, TType>);
        this.off(eventType as string, wrappedHandler);
      }
    };
    return this.on(eventType as string, wrappedHandler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Unsubscribe from a typed domain event
   */
  offEvent<
    TEventMap extends Record<string, unknown> = MFEEventMap,
    TType extends EventType<TEventMap> = EventType<TEventMap>
  >(
    eventType: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): void {
    // This is tricky because we need to find the wrapped handler
    // For now, we'll require users to keep a reference to the unsubscribe function
    console.warn('offEvent: Use the unsubscribe function returned from onEvent instead');
  }

  /**
   * Remove all listeners for an event, or all events if no event specified
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount(event: string): number {
    const handlers = this.handlers.get(event);
    return handlers ? handlers.size : 0;
  }

  /**
   * Clear all event handlers
   * @deprecated Use removeAllListeners() instead
   */
  clear(): void {
    this.removeAllListeners();
  }

  /**
   * Get the number of handlers for an event
   * @deprecated Use listenerCount() instead
   */
  getHandlerCount(event: string): number {
    return this.listenerCount(event);
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