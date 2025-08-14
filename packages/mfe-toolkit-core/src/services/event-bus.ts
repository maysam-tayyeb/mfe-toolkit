import { EventBus, EventPayload } from '../types';

/**
 * Simple EventBus implementation
 */
class EventBusImpl implements EventBus {
  private listeners = new Map<string, Set<(payload: EventPayload<any>) => void>>();
  private wildcardListeners = new Set<(payload: EventPayload<any>) => void>();
  private source: string;
  private debug: boolean;

  constructor(options?: { source?: string; debug?: boolean }) {
    this.source = options?.source || 'mfe-platform';
    this.debug = options?.debug || false;
  }

  emit<T = any>(event: string, data: T): void {
    const payload: EventPayload<T> = {
      type: event,
      data,
      timestamp: Date.now(),
      source: this.source,
    };

    if (this.debug) {
      console.log(`[EventBus] Emit ${event}:`, payload);
    }

    // Notify specific listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(handler => handler(payload));
    }

    // Notify wildcard listeners
    this.wildcardListeners.forEach(handler => handler(payload));
  }

  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void {
    if (event === '*') {
      // Wildcard listener
      this.wildcardListeners.add(handler);
      return () => this.wildcardListeners.delete(handler);
    }

    // Specific event listener
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(handler);
        if (listeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  off(event: string, handler: (payload: EventPayload<any>) => void): void {
    if (event === '*') {
      this.wildcardListeners.delete(handler);
      return;
    }

    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  once<T = any>(event: string, handler: (payload: EventPayload<T>) => void): void {
    const unsubscribe = this.on(event, (payload: EventPayload<T>) => {
      unsubscribe();
      handler(payload);
    });
  }
}

/**
 * Create an event bus instance
 *
 * @param options - Configuration options
 * @param options.source - Source identifier for events
 * @param options.debug - Enable debug logging
 * @returns EventBus instance
 */
export const createEventBus = (options?: { source?: string; debug?: boolean }): EventBus => {
  return new EventBusImpl(options);
};