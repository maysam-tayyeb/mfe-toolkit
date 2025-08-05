import type { EventMap, EventType, EventData, TypedEvent, BaseEvent, MFEEventMap, EventSchema } from '../types/events';
import type { EventBus, EventPayload } from '../types';
/**
 * Handler type for typed events
 */
export type TypedEventHandler<TEventMap extends EventMap, TType extends EventType<TEventMap>> = (event: TypedEvent<TEventMap, TType>) => void;
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
    afterHandle?: (event: TypedEvent<TEventMap>, handler: (...args: any[]) => void, error?: Error) => void;
};
/**
 * Typed Event Bus Interface
 */
export interface TypedEventBus<TEventMap extends EventMap = MFEEventMap> extends EventBus {
    /**
     * Emit a typed event
     */
    emit<TType extends EventType<TEventMap>>(type: TType, data: EventData<TEventMap, TType>, options?: {
        correlationId?: string;
        version?: string;
    }): void;
    /**
     * Emit any event (for backward compatibility)
     */
    emit(type: string, data: any): void;
    /**
     * Subscribe to a typed event
     */
    on<TType extends EventType<TEventMap>>(type: TType, handler: TypedEventHandler<TEventMap, TType>): Unsubscribe;
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
    once<TType extends EventType<TEventMap>>(type: TType, handler: TypedEventHandler<TEventMap, TType>): void;
    /**
     * Subscribe to any event once (for backward compatibility)
     */
    once(type: string, handler: LegacyEventHandler): void;
    /**
     * Wait for an event to occur
     */
    waitFor<TType extends EventType<TEventMap>>(type: TType, options?: {
        timeout?: number;
        filter?: (event: TypedEvent<TEventMap, TType>) => boolean;
    }): Promise<TypedEvent<TEventMap, TType>>;
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
export declare class TypedEventBusImpl<TEventMap extends EventMap = MFEEventMap> implements TypedEventBus<TEventMap> {
    private options;
    private handlers;
    private wildcardHandlers;
    private stats;
    constructor(options?: TypedEventBusOptions<TEventMap>);
    emit<TType extends EventType<TEventMap>>(type: TType | string, data: TType extends EventType<TEventMap> ? EventData<TEventMap, TType> : any, options?: {
        correlationId?: string;
        version?: string;
    }): void;
    on<TType extends EventType<TEventMap>>(type: TType | string | '*', handler: TypedEventHandler<TEventMap, TType> | LegacyEventHandler | AnyEventHandler<TEventMap>): Unsubscribe;
    off(type: string, handler: (...args: any[]) => void): void;
    once<TType extends EventType<TEventMap>>(type: TType | string, handler: TypedEventHandler<TEventMap, TType> | LegacyEventHandler): void;
    waitFor<TType extends EventType<TEventMap>>(type: TType, options?: {
        timeout?: number;
        filter?: (event: TypedEvent<TEventMap, TType>) => boolean;
    }): Promise<TypedEvent<TEventMap, TType>>;
    getStats(): EventBusStats;
    clear(): void;
    private invokeHandler;
    private handleError;
    private debug;
    private updateHandlerStats;
    private updateWildcardStats;
}
/**
 * Create a typed event bus with default MFE event map
 */
export declare function createTypedEventBus(options?: TypedEventBusOptions<MFEEventMap>): TypedEventBus<MFEEventMap>;
/**
 * Create a typed event bus with custom event map
 */
export declare function createCustomEventBus<TEventMap extends EventMap>(options?: TypedEventBusOptions<TEventMap>): TypedEventBus<TEventMap>;
//# sourceMappingURL=typed-event-bus.d.ts.map