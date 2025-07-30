import type {
  EventMap,
  EventType,
  EventData,
  TypedEvent,
  BaseEvent,
  MFEEventMap,
  EventSchema,
} from '../types/events';
import { createEvent as createEventUtil } from '../types/events';
import type { EventBus, EventPayload } from '../types';

/**
 * Handler type for typed events
 */
export type TypedEventHandler<TEventMap extends EventMap, TType extends EventType<TEventMap>> = (
  event: TypedEvent<TEventMap, TType>
) => void;

/**
 * Handler type for any event (used for wildcard)
 */
export type AnyEventHandler<TEventMap extends EventMap> = (event: TypedEvent<TEventMap>) => void;

/**
 * Legacy handler type for backward compatibility
 */
export type LegacyEventHandler = (event: EventPayload<any>) => void;

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => void;

/**
 * Options for typed event bus
 */
export type TypedEventBusOptions<TEventMap extends EventMap> = {
  /**
   * Source identifier for events emitted by this bus
   */
  source?: string;
  /**
   * Event validation schema
   */
  schema?: EventSchema<TEventMap>;
  /**
   * Enable debug logging
   */
  debug?: boolean;
  /**
   * Error handler for event processing errors
   */
  onError?: (error: Error, event: BaseEvent) => void;
  /**
   * Event interceptors for middleware functionality
   */
  interceptors?: EventInterceptor<TEventMap>[];
};

/**
 * Event interceptor for middleware functionality
 */
export type EventInterceptor<TEventMap extends EventMap> = {
  /**
   * Called before an event is emitted
   */
  beforeEmit?: (event: TypedEvent<TEventMap>) => TypedEvent<TEventMap> | null;
  /**
   * Called after an event is emitted
   */
  afterEmit?: (event: TypedEvent<TEventMap>) => void;
  /**
   * Called before a handler is invoked
   */
  beforeHandle?: (event: TypedEvent<TEventMap>, handler: (...args: any[]) => void) => boolean;
  /**
   * Called after a handler is invoked
   */
  afterHandle?: (
    event: TypedEvent<TEventMap>,
    handler: (...args: any[]) => void,
    error?: Error
  ) => void;
};

/**
 * Typed Event Bus Interface
 */
export interface TypedEventBus<TEventMap extends EventMap = MFEEventMap> extends EventBus {
  /**
   * Emit a typed event
   */
  emit<TType extends EventType<TEventMap>>(
    type: TType,
    data: EventData<TEventMap, TType>,
    options?: {
      correlationId?: string;
      version?: string;
    }
  ): void;

  /**
   * Emit any event (for backward compatibility)
   */
  emit(type: string, data: any): void;

  /**
   * Subscribe to a typed event
   */
  on<TType extends EventType<TEventMap>>(
    type: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): Unsubscribe;

  /**
   * Subscribe to any event type (for backward compatibility)
   */
  on(type: string, handler: LegacyEventHandler): Unsubscribe;

  /**
   * Subscribe to all events
   */
  on(type: '*', handler: AnyEventHandler<TEventMap>): Unsubscribe;

  /**
   * Unsubscribe from an event
   */
  off(type: string, handler: (...args: any[]) => void): void;

  /**
   * Subscribe to an event once
   */
  once<TType extends EventType<TEventMap>>(
    type: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): void;

  /**
   * Subscribe to any event once (for backward compatibility)
   */
  once(type: string, handler: LegacyEventHandler): void;

  /**
   * Wait for an event to occur
   */
  waitFor<TType extends EventType<TEventMap>>(
    type: TType,
    options?: {
      timeout?: number;
      filter?: (event: TypedEvent<TEventMap, TType>) => boolean;
    }
  ): Promise<TypedEvent<TEventMap, TType>>;

  /**
   * Get event statistics
   */
  getStats(): EventBusStats;

  /**
   * Clear all event handlers
   */
  clear(): void;
}

/**
 * Event bus statistics
 */
export type EventBusStats = {
  totalEvents: number;
  eventCounts: Record<string, number>;
  handlerCounts: Record<string, number>;
  wildcardHandlers: number;
  errors: number;
};

/**
 * Implementation of typed event bus
 */
export class TypedEventBusImpl<TEventMap extends EventMap = MFEEventMap>
  implements TypedEventBus<TEventMap>
{
  private handlers: Map<string, Set<(...args: any[]) => void>> = new Map();
  private wildcardHandlers: Set<(...args: any[]) => void> = new Set();
  private stats: EventBusStats = {
    totalEvents: 0,
    eventCounts: {},
    handlerCounts: {},
    wildcardHandlers: 0,
    errors: 0,
  };

  constructor(private options: TypedEventBusOptions<TEventMap> = {}) {
    this.updateWildcardStats();
  }

  emit<TType extends EventType<TEventMap>>(
    type: TType | string,
    data: TType extends EventType<TEventMap> ? EventData<TEventMap, TType> : any,
    options?: {
      correlationId?: string;
      version?: string;
    }
  ): void {
    // Create event payload
    const event = createEventUtil(
      type as any,
      data,
      this.options.source || 'unknown',
      options
    ) as TypedEvent<TEventMap>;

    // Update statistics
    this.stats.totalEvents++;
    this.stats.eventCounts[type] = (this.stats.eventCounts[type] || 0) + 1;

    // Apply interceptors
    let processedEvent = event;
    if (this.options.interceptors) {
      for (const interceptor of this.options.interceptors) {
        if (interceptor.beforeEmit) {
          const result = interceptor.beforeEmit(processedEvent);
          if (result === null) {
            // Event cancelled by interceptor
            this.debug(`Event ${type} cancelled by interceptor`);
            return;
          }
          processedEvent = result;
        }
      }
    }

    // Validate event if schema is provided
    if (this.options.schema && type in this.options.schema) {
      const validator = this.options.schema[type as EventType<TEventMap>];
      if (validator && !validator(data)) {
        this.handleError(new Error(`Invalid event data for type: ${type}`), processedEvent);
        return;
      }
    }

    // Debug logging
    this.debug(`Emitting event: ${type}`, processedEvent);

    // Emit to specific handlers
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        this.invokeHandler(handler, processedEvent);
      });
    }

    // Emit to wildcard handlers
    this.wildcardHandlers.forEach((handler) => {
      this.invokeHandler(handler, processedEvent);
    });

    // After emit interceptors
    if (this.options.interceptors) {
      for (const interceptor of this.options.interceptors) {
        if (interceptor.afterEmit) {
          interceptor.afterEmit(processedEvent);
        }
      }
    }
  }

  on<TType extends EventType<TEventMap>>(
    type: TType | string | '*',
    handler: TypedEventHandler<TEventMap, TType> | LegacyEventHandler | AnyEventHandler<TEventMap>
  ): Unsubscribe {
    // Handle wildcard subscription
    if (type === '*') {
      this.wildcardHandlers.add(handler);
      this.updateWildcardStats();
      return () => {
        this.wildcardHandlers.delete(handler);
        this.updateWildcardStats();
      };
    }

    // Handle specific event subscription
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    const handlers = this.handlers.get(type)!;
    handlers.add(handler);
    this.updateHandlerStats();

    return () => this.off(type, handler);
  }

  off(type: string, handler: (...args: any[]) => void): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
      this.updateHandlerStats();
    }
  }

  once<TType extends EventType<TEventMap>>(
    type: TType | string,
    handler: TypedEventHandler<TEventMap, TType> | LegacyEventHandler
  ): void {
    const onceHandler = (event: any) => {
      handler(event);
      this.off(type, onceHandler);
    };
    this.on(type as any, onceHandler);
  }

  async waitFor<TType extends EventType<TEventMap>>(
    type: TType,
    options: {
      timeout?: number;
      filter?: (event: TypedEvent<TEventMap, TType>) => boolean;
    } = {}
  ): Promise<TypedEvent<TEventMap, TType>> {
    return new Promise((resolve, reject) => {
      const timeoutMs = options.timeout || 30000;
      const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event: ${type}`));
      }, timeoutMs);

      const handler = (event: TypedEvent<TEventMap, TType>) => {
        if (!options.filter || options.filter(event)) {
          clearTimeout(timeoutId);
          resolve(event);
        }
      };

      const unsubscribe = this.on(type, handler);
    });
  }

  getStats(): EventBusStats {
    return { ...this.stats };
  }

  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
    this.stats = {
      totalEvents: 0,
      eventCounts: {},
      handlerCounts: {},
      wildcardHandlers: 0,
      errors: 0,
    };
  }

  private invokeHandler(handler: (...args: any[]) => void, event: TypedEvent<TEventMap>): void {
    try {
      // Apply before handle interceptors
      if (this.options.interceptors) {
        for (const interceptor of this.options.interceptors) {
          if (interceptor.beforeHandle) {
            const shouldContinue = interceptor.beforeHandle(event, handler);
            if (!shouldContinue) {
              return;
            }
          }
        }
      }

      // Convert to legacy format for backward compatibility
      const legacyPayload: EventPayload<any> = {
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
        source: event.source,
      };

      // Invoke handler with legacy format for compatibility
      handler(legacyPayload);

      // Apply after handle interceptors
      if (this.options.interceptors) {
        for (const interceptor of this.options.interceptors) {
          if (interceptor.afterHandle) {
            interceptor.afterHandle(event, handler);
          }
        }
      }
    } catch (error) {
      this.handleError(error as Error, event);

      // Apply after handle interceptors with error
      if (this.options.interceptors) {
        for (const interceptor of this.options.interceptors) {
          if (interceptor.afterHandle) {
            interceptor.afterHandle(event, handler, error as Error);
          }
        }
      }
    }
  }

  private handleError(error: Error, event: BaseEvent): void {
    this.stats.errors++;
    if (this.options.onError) {
      this.options.onError(error, event);
    } else {
      console.error(`Error in event handler for ${event.type}:`, error);
    }
  }

  private debug(message: string, ...args: any[]): void {
    if (this.options.debug) {
      console.warn(`[EventBus] ${message}`, ...args);
    }
  }

  private updateHandlerStats(): void {
    this.stats.handlerCounts = {};
    this.handlers.forEach((handlers, type) => {
      this.stats.handlerCounts[type] = handlers.size;
    });
  }

  private updateWildcardStats(): void {
    this.stats.wildcardHandlers = this.wildcardHandlers.size;
  }
}

/**
 * Create a typed event bus with default MFE event map
 */
export function createTypedEventBus(
  options?: TypedEventBusOptions<MFEEventMap>
): TypedEventBus<MFEEventMap> {
  return new TypedEventBusImpl<MFEEventMap>(options);
}

/**
 * Create a typed event bus with custom event map
 */
export function createCustomEventBus<TEventMap extends EventMap>(
  options?: TypedEventBusOptions<TEventMap>
): TypedEventBus<TEventMap> {
  return new TypedEventBusImpl<TEventMap>(options);
}
