import { EventBus, EventPayload } from '../types';

export class EventBusImpl implements EventBus {
  private events: Map<string, Set<(payload: EventPayload<any>) => void>> = new Map();
  private wildcardHandlers: Set<(payload: EventPayload<any>) => void> = new Set();

  emit<T = any>(event: string, data: T): void {
    const payload: EventPayload<T> = {
      type: event,
      data,
      timestamp: Date.now(),
      source: 'unknown',
    };

    // Emit to specific event handlers
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Emit to wildcard handlers
    this.wildcardHandlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`Error in wildcard event handler:`, error);
      }
    });
  }

  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void {
    // Support wildcard '*' to listen to all events
    if (event === '*') {
      this.wildcardHandlers.add(handler);
      return () => this.wildcardHandlers.delete(handler);
    }

    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  off(event: string, handler: (payload: EventPayload<any>) => void): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
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
}

export const createEventBus = (): EventBus => new EventBusImpl();
