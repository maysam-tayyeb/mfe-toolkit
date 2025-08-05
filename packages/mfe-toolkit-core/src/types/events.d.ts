/**
 * Typed Event System for MFE Platform
 *
 * This module provides type-safe event definitions and utilities for the MFE event bus.
 * It uses TypeScript discriminated unions to ensure compile-time type safety.
 */
/**
 * Base event structure that all events must extend
 */
export type BaseEvent<TType extends string = string, TData = unknown> = {
    type: TType;
    data: TData;
    timestamp: number;
    source: string;
    version?: string;
    correlationId?: string;
};
/**
 * Event map interface for defining event schemas
 * Each key is an event type, and the value is the event data type
 */
export type EventMap = Record<string, unknown>;
/**
 * Extract event types from an event map
 */
export type EventType<TEventMap extends EventMap> = keyof TEventMap & string;
/**
 * Extract event data type for a specific event
 */
export type EventData<TEventMap extends EventMap, TType extends EventType<TEventMap>> = TEventMap[TType];
/**
 * Create a typed event from an event map
 */
export type TypedEvent<TEventMap extends EventMap, TType extends EventType<TEventMap> = EventType<TEventMap>> = TType extends EventType<TEventMap> ? BaseEvent<TType, EventData<TEventMap, TType>> : never;
/**
 * Standard MFE platform events
 */
export type MFEEventMap = {
    'mfe:loaded': {
        name: string;
        version: string;
        metadata?: Record<string, unknown>;
    };
    'mfe:unloaded': {
        name: string;
        reason?: string;
    };
    'mfe:error': {
        name: string;
        error: string;
        stack?: string;
        context?: Record<string, unknown>;
    };
    'mfe:ready': {
        name: string;
        capabilities?: string[];
    };
    'navigation:change': {
        from: string;
        to: string;
        method: 'push' | 'replace' | 'back' | 'forward';
    };
    'navigation:request': {
        path: string;
        params?: Record<string, string>;
        query?: Record<string, string>;
    };
    'user:login': {
        userId: string;
        username: string;
        roles: string[];
    };
    'user:logout': {
        userId: string;
        reason?: string;
    };
    'user:action': {
        action: string;
        target?: string;
        data?: unknown;
    };
    'state:sync': {
        from: string;
        state: unknown;
        partial?: boolean;
    };
    'state:request': {
        from: string;
        keys?: string[];
    };
    'state:response': {
        to: string;
        state: unknown;
        requestId?: string;
    };
    'broadcast:message': {
        from: string;
        to: 'all' | string[];
        message: unknown;
        priority?: 'low' | 'normal' | 'high';
    };
    'request:data': {
        from: string;
        to: string;
        requestId: string;
        query: unknown;
    };
    'response:data': {
        from: string;
        to: string;
        requestId: string;
        data: unknown;
        error?: string;
    };
};
/**
 * Type helper for standard MFE events
 */
export type MFEEvent = TypedEvent<MFEEventMap>;
export type MFEEventType = EventType<MFEEventMap>;
/**
 * Type guard to check if an event matches a specific type
 */
export declare function isEventType<TEventMap extends EventMap, TType extends EventType<TEventMap>>(event: BaseEvent, type: TType, _eventMap?: TEventMap): event is TypedEvent<TEventMap, TType>;
/**
 * Create a typed event payload
 */
export declare function createEvent<TEventMap extends EventMap, TType extends EventType<TEventMap>>(type: TType, data: EventData<TEventMap, TType>, source: string, options?: {
    version?: string;
    correlationId?: string;
}): TypedEvent<TEventMap, TType>;
/**
 * Event namespace utilities
 */
export declare const EventNamespace: {
    /**
     * Check if an event belongs to a namespace
     */
    matches(eventType: string, namespace: string): boolean;
    /**
     * Extract namespace from event type
     */
    extract(eventType: string): string | null;
    /**
     * Create a namespaced event type
     */
    create(namespace: string, eventName: string): string;
};
export type EventValidator<T = unknown> = (data: unknown) => data is T;
export type EventSchema<TEventMap extends EventMap> = {
    [K in EventType<TEventMap>]?: EventValidator<EventData<TEventMap, K>>;
};
/**
 * Create a validator for an event map
 */
export declare function createEventValidator<TEventMap extends EventMap>(schema: EventSchema<TEventMap>): (event: BaseEvent) => event is TypedEvent<TEventMap>;
/**
 * Legacy event type for backward compatibility
 */
export type LegacyEvent = BaseEvent<string, any>;
/**
 * Convert legacy event to typed event (if possible)
 */
export declare function fromLegacyEvent<TEventMap extends EventMap>(event: LegacyEvent, eventMap?: TEventMap): TypedEvent<TEventMap> | LegacyEvent;
/**
 * Type guard for checking if an event is typed
 */
export declare function isTypedEvent<TEventMap extends EventMap>(event: BaseEvent, eventMap: TEventMap): event is TypedEvent<TEventMap>;
//# sourceMappingURL=events.d.ts.map