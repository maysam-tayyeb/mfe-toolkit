/**
 * Event Bus Service Types
 * 
 * Core types for the event bus service that provides pub/sub messaging
 * capabilities for inter-MFE communication.
 */

/**
 * Base event payload structure
 */
export interface EventPayload<T = any> {
  type: string;
  data?: T;
  timestamp: number;
  source: string;
  metadata?: Record<string, unknown>;
}

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (event: EventPayload<T>) => void;

/**
 * Event Bus interface with unified methods
 * Single API surface with intelligent overloads for maximum flexibility
 */
export interface EventBus {
  /**
   * Emit an event - supports multiple signatures for flexibility
   */
  emit<T = any>(type: string, data?: T): void;
  emit<T = any>(event: EventPayload<T>): void;

  /**
   * Subscribe to events - returns unsubscribe function
   */
  on<T = any>(type: string, handler: EventHandler<T>): () => void;

  /**
   * Subscribe once - auto-unsubscribe after first event
   */
  once<T = any>(type: string, handler: EventHandler<T>): () => void;

  /**
   * Unsubscribe from events
   */
  off<T = any>(type: string, handler: EventHandler<T>): void;

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
  getEventHistory(limit?: number): EventPayload[];

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
 * Configuration options for EventBus
 */
export interface EventBusConfig {
  /**
   * Enable debug logging
   */
  debug?: boolean;
  
  /**
   * Maximum event history size
   */
  maxHistorySize?: number;
  
  /**
   * Enable event validation
   */
  enableValidation?: boolean;
  
  /**
   * Custom logger instance
   */
  logger?: {
    debug: (message: string, data?: unknown) => void;
    info: (message: string, data?: unknown) => void;
    warn: (message: string, data?: unknown) => void;
    error: (message: string, data?: unknown) => void;
  };
}