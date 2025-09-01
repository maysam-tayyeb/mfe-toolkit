/**
 * Event Bus Service Interface
 * 
 * Provides pub/sub messaging capabilities for inter-MFE communication.
 * Enables decoupled communication between MFEs and the container.
 * 
 * Supports both simple EventPayload (legacy) and rich BaseEvent types
 * from the domain event system for maximum flexibility.
 */

import type { BaseEvent, MFEEventMap, EventType, TypedEvent } from '../../domain/events';

/**
 * Legacy event payload structure for backward compatibility
 * @deprecated Use BaseEvent from domain/events for new code
 */
export interface EventPayload<T = any> {
  /**
   * Event type/name identifier
   */
  type: string;

  /**
   * Event data payload
   */
  data?: T;

  /**
   * Timestamp when the event was emitted
   */
  timestamp: number;

  /**
   * Source identifier (MFE name or 'container')
   */
  source: string;
}

/**
 * Union type supporting both event formats
 */
export type AnyEvent<T = any> = EventPayload<T> | BaseEvent<string, T>;

/**
 * Event handler that accepts both event formats
 */
export type EventHandler<T = any> = (event: AnyEvent<T>) => void;

/**
 * Type-safe event handler for domain events
 */
export type TypedEventHandler<
  TEventMap extends Record<string, unknown>,
  TType extends EventType<TEventMap>
> = (event: TypedEvent<TEventMap, TType>) => void;

/**
 * Event Bus service interface for pub/sub communication
 * Supports both legacy EventPayload and domain BaseEvent types
 */
export interface EventBus {
  /**
   * Emit an event to all subscribers
   * @param event - Event type/name
   * @param data - Event data (will be wrapped in EventPayload for compatibility)
   */
  emit<T = any>(event: string, data?: T): void;

  /**
   * Emit a typed domain event
   * @param event - Complete event object following BaseEvent structure
   */
  emitEvent<T extends BaseEvent>(event: T): void;

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void;

  /**
   * Subscribe to a typed domain event
   * @returns Unsubscribe function
   */
  onEvent<
    TEventMap extends Record<string, unknown> = MFEEventMap,
    TType extends EventType<TEventMap> = EventType<TEventMap>
  >(
    eventType: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): () => void;

  /**
   * Subscribe to an event once (auto-unsubscribe after first emission)
   * @returns Unsubscribe function
   */
  once<T = any>(event: string, handler: EventHandler<T>): () => void;

  /**
   * Subscribe to a typed domain event once
   * @returns Unsubscribe function
   */
  onceEvent<
    TEventMap extends Record<string, unknown> = MFEEventMap,
    TType extends EventType<TEventMap> = EventType<TEventMap>
  >(
    eventType: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): () => void;

  /**
   * Unsubscribe from an event (alternative to using returned function)
   */
  off<T = any>(event: string, handler: EventHandler<T>): void;

  /**
   * Unsubscribe from a typed domain event
   */
  offEvent<
    TEventMap extends Record<string, unknown> = MFEEventMap,
    TType extends EventType<TEventMap> = EventType<TEventMap>
  >(
    eventType: TType,
    handler: TypedEventHandler<TEventMap, TType>
  ): void;

  /**
   * Remove all event handlers for a specific event type
   */
  removeAllListeners(event?: string): void;

  /**
   * Get the count of listeners for an event
   */
  listenerCount(event: string): number;
}

/**
 * Service key for event bus in the service registry
 */
export const EVENT_BUS_SERVICE_KEY = 'eventBus';

/**
 * Helper to convert EventPayload to BaseEvent
 */
export function toBaseEvent<T = any>(payload: EventPayload<T>): BaseEvent<string, T> {
  return {
    type: payload.type,
    data: payload.data as T,
    timestamp: payload.timestamp,
    source: payload.source,
  };
}

/**
 * Helper to convert BaseEvent to EventPayload
 */
export function toEventPayload<T = any>(event: BaseEvent<string, T>): EventPayload<T> {
  return {
    type: event.type,
    data: event.data,
    timestamp: event.timestamp,
    source: event.source,
  };
}

/**
 * Type guard to check if an event is a BaseEvent
 */
export function isBaseEvent(event: AnyEvent): event is BaseEvent {
  return typeof event === 'object' && 
    'type' in event && 
    'timestamp' in event && 
    'source' in event &&
    !('data' in event && event.data === undefined && Object.keys(event).length === 4);
}

/**
 * Type guard to check if an event is an EventPayload
 */
export function isEventPayload(event: AnyEvent): event is EventPayload {
  return typeof event === 'object' && 
    'type' in event && 
    'timestamp' in event && 
    'source' in event &&
    Object.keys(event).length <= 4;
}