import type { EventBus, EventPayload } from '../types';
import type { TypedEventBus, TypedEventBusOptions } from './typed-event-bus';
import type { EventMap, MFEEventMap } from '../types/events';
/**
 * Migration adapter that wraps a typed event bus to provide backward compatibility
 * with the legacy EventBus interface while enabling gradual migration to typed events.
 */
export declare class EventBusMigrationAdapter<TEventMap extends EventMap = MFEEventMap> implements EventBus {
    private typedEventBus;
    constructor(typedEventBus: TypedEventBus<TEventMap>);
    emit<T = any>(event: string, data: T): void;
    on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void;
    off(event: string, handler: (payload: EventPayload<any>) => void): void;
    once<T = any>(event: string, handler: (payload: EventPayload<T>) => void): void;
    /**
     * Get access to the underlying typed event bus for gradual migration
     */
    get typed(): TypedEventBus<TEventMap>;
}
/**
 * Create a migration-ready event bus that supports both typed and untyped usage
 */
export declare function createMigrationEventBus<TEventMap extends EventMap = MFEEventMap>(options?: TypedEventBusOptions<TEventMap>): EventBus & {
    typed: TypedEventBus<TEventMap>;
};
/**
 * Migration helper to analyze event usage in code
 */
export declare class EventUsageAnalyzer {
    private eventTypes;
    private eventData;
    /**
     * Track an event emission
     */
    trackEmit(eventType: string, data: any): void;
    /**
     * Get all tracked event types
     */
    getEventTypes(): string[];
    /**
     * Get sample data for an event type
     */
    getSampleData(eventType: string): any[];
    /**
     * Generate TypeScript type definitions based on tracked events
     */
    generateTypeDefinitions(): string;
    private inferTypeFromSamples;
    /**
     * Reset tracked data
     */
    reset(): void;
}
/**
 * Development-time event bus wrapper that tracks usage
 */
export declare function createAnalyzingEventBus(eventBus: EventBus, analyzer: EventUsageAnalyzer): EventBus;
/**
 * Migration guide generator
 */
export declare function generateMigrationGuide(analyzer: EventUsageAnalyzer): string;
//# sourceMappingURL=event-bus-migration.d.ts.map