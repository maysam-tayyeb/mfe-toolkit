/**
 * Event Bus Service Interface
 * 
 * Provides pub/sub messaging capabilities for inter-MFE communication.
 * Enables decoupled communication between MFEs and the container.
 */

/**
 * Event payload structure for type-safe event handling
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
 * Event Bus service interface for pub/sub communication
 */
export interface EventBus {
  /**
   * Emit an event to all subscribers
   */
  emit<T = any>(event: string, data?: T): void;

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void;

  /**
   * Subscribe to an event once (auto-unsubscribe after first emission)
   * @returns Unsubscribe function
   */
  once<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void;

  /**
   * Unsubscribe from an event (alternative to using returned function)
   */
  off<T = any>(event: string, handler: (payload: EventPayload<T>) => void): void;
}

/**
 * Service key for event bus in the service registry
 */
export const EVENT_BUS_SERVICE_KEY = 'eventBus';