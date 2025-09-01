/**
 * Simple Event Bus Implementation
 * 
 * Clean, unified implementation with single internal format and debugging features.
 */

import type { EventBus } from '../../../../services/types/event-bus';
import { EventValidators } from '../../../../services/types/event-bus';
import type { BaseEvent } from '../../../../domain/events';

type EventHandler = (event: BaseEvent) => void;

export class SimpleEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private eventHistory: BaseEvent[] = [];
  private loggingEnabled = false;
  private validationEnabled = false;
  private source: string;
  private stats = {
    totalEmitted: 0,
    eventCounts: {} as Record<string, number>,
  };
  private maxHistorySize = 100;

  constructor(source: string = 'container') {
    this.source = source;
    
    // Enable validation in development by default
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      this.validationEnabled = true;
    }
  }

  /**
   * Unified emit method with overload support
   */
  emit(...args: any[]): void {
    const event = this.normalizeToBaseEvent(args);
    
    // Validation in development
    if (this.validationEnabled) {
      this.validateEvent(event);
    }
    
    // Logging
    if (this.loggingEnabled) {
      console.log(`[EventBus] ${event.type}`, event);
    }
    
    // Update statistics
    this.updateStats(event);
    
    // Store in history
    this.addToHistory(event);
    
    // Dispatch to handlers
    this.dispatch(event);
  }

  /**
   * Convert various emit signatures to BaseEvent
   */
  private normalizeToBaseEvent(args: any[]): BaseEvent {
    // Case 1: Single BaseEvent object
    if (args.length === 1 && typeof args[0] === 'object' && 'type' in args[0] && 'timestamp' in args[0]) {
      return {
        ...args[0],
        source: args[0].source || this.source,
      };
    }
    
    // Case 2: Type and data (legacy or typed)
    if (args.length >= 1 && typeof args[0] === 'string') {
      return {
        type: args[0],
        data: args[1],
        timestamp: Date.now(),
        source: this.source,
      };
    }
    
    throw new Error(`Invalid emit arguments: ${JSON.stringify(args)}`);
  }

  /**
   * Subscribe to events with type safety
   */
  on(...args: any[]): () => void {
    const [type, handler] = args;
    
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    // Wrap the handler to ensure it receives BaseEvent
    const wrappedHandler: EventHandler = (event: BaseEvent) => {
      handler(event);
    };
    
    this.handlers.get(type)!.add(wrappedHandler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(wrappedHandler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe once - auto-unsubscribe after first event
   */
  once(...args: any[]): () => void {
    const [type, handler] = args;
    
    const unsubscribe = this.on(type, (event: EventPayload) => {
      handler(event);
      unsubscribe();
    });
    
    return unsubscribe;
  }

  /**
   * Unsubscribe from events
   */
  off(...args: any[]): void {
    const [type] = args;
    const handlers = this.handlers.get(type);
    
    if (handlers) {
      // Find and remove the wrapped handler
      handlers.forEach(h => {
        // This is simplified - in production we'd track handler mappings
        handlers.delete(h);
      });
      
      if (handlers.size === 0) {
        this.handlers.delete(type);
      }
    }
  }

  /**
   * Remove all listeners for a type or all types
   */
  removeAllListeners(type?: string): void {
    if (type) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Get listener count for a type
   */
  listenerCount(type: string): number {
    return this.handlers.get(type)?.size || 0;
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  // ============================================================================
  // Debugging Features
  // ============================================================================

  /**
   * Enable/disable event logging
   */
  enableLogging(enabled: boolean): void {
    this.loggingEnabled = enabled;
    if (enabled) {
      console.log('[EventBus] Logging enabled');
    }
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): BaseEvent[] {
    if (!limit) {
      return [...this.eventHistory];
    }
    return this.eventHistory.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Enable/disable validation
   */
  enableValidation(enabled: boolean): void {
    this.validationEnabled = enabled;
    if (enabled) {
      console.log('[EventBus] Validation enabled');
    }
  }

  /**
   * Get event statistics
   */
  getEventStats() {
    const handlerCounts: Record<string, number> = {};
    this.handlers.forEach((handlers, type) => {
      handlerCounts[type] = handlers.size;
    });
    
    return {
      totalEmitted: this.stats.totalEmitted,
      totalHandlers: Array.from(this.handlers.values()).reduce((sum, set) => sum + set.size, 0),
      eventCounts: { ...this.stats.eventCounts },
      handlerCounts,
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Dispatch event to handlers
   */
  private dispatch(event: EventPayload): void {
    // Dispatch to specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${event.type}:`, error);
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
          console.error(`[EventBus] Error in wildcard handler for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Validate event structure in development
   */
  private validateEvent(event: EventPayload): void {
    // Basic structure validation
    if (!event.type || typeof event.type !== 'string') {
      console.warn('[EventBus] Invalid event: missing or invalid type', event);
    }
    
    if (!event.timestamp || typeof event.timestamp !== 'number') {
      console.warn('[EventBus] Invalid event: missing or invalid timestamp', event);
    }
    
    if (!event.source || typeof event.source !== 'string') {
      console.warn('[EventBus] Invalid event: missing or invalid source', event);
    }
    
    // Type-specific validation
    const validators = EventValidators as any;
    if (validators[event.type]) {
      if (!validators[event.type](event.data)) {
        console.warn(`[EventBus] Invalid event data for ${event.type}:`, event.data);
      }
    }
  }

  /**
   * Add event to history
   */
  private addToHistory(event: EventPayload): void {
    this.eventHistory.push(event);
    
    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Update event statistics
   */
  private updateStats(event: EventPayload): void {
    this.stats.totalEmitted++;
    this.stats.eventCounts[event.type] = (this.stats.eventCounts[event.type] || 0) + 1;
  }
}

/**
 * Factory function for creating a simple event bus
 */
export function createSimpleEventBus(source?: string): EventBus {
  return new SimpleEventBus(source);
}

/**
 * Default event bus instance
 */
export const defaultEventBus = createSimpleEventBus('default');

/**
 * Event flow debugger for development
 */
export class EventFlowDebugger {
  private flows = new Map<string, { source: Set<string>; targets: Set<string> }>();
  
  constructor(private eventBus: EventBus) {
    this.startTracking();
  }
  
  private startTracking(): void {
    // Track all events
    this.eventBus.on('*', (event: EventPayload) => {
      if (!this.flows.has(event.type)) {
        this.flows.set(event.type, { source: new Set(), targets: new Set() });
      }
      const flow = this.flows.get(event.type)!;
      flow.source.add(event.source);
    });
  }
  
  /**
   * Generate a visual representation of event flows
   */
  getFlowDiagram(): string {
    const lines: string[] = ['Event Flow Diagram', '=================='];
    
    this.flows.forEach((flow, eventType) => {
      lines.push(`\n${eventType}:`);
      lines.push(`  Sources: ${Array.from(flow.source).join(', ')}`);
      lines.push(`  Listeners: ${this.eventBus.listenerCount(eventType)}`);
    });
    
    lines.push('\nStatistics:');
    const stats = this.eventBus.getEventStats();
    lines.push(`  Total Events: ${stats.totalEmitted}`);
    lines.push(`  Total Handlers: ${stats.totalHandlers}`);
    
    return lines.join('\n');
  }
  
  /**
   * Get mermaid diagram for visualization
   */
  getMermaidDiagram(): string {
    const lines: string[] = ['graph LR'];
    
    this.flows.forEach((flow, eventType) => {
      flow.source.forEach(source => {
        lines.push(`  ${source} -->|${eventType}| Handlers`);
      });
    });
    
    return lines.join('\n');
  }
}