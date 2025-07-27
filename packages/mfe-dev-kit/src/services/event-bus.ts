import { EventBus, EventPayload } from '../types';

export class EventBusImpl implements EventBus {
  private events: Map<string, Set<(payload: EventPayload<any>) => void>> = new Map();

  emit<T = any>(event: string, data: T): void {
    const payload: EventPayload<T> = {
      type: event,
      data,
      timestamp: Date.now(),
      source: 'unknown',
    };

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
  }

  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void {
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
