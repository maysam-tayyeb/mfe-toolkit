import { TypedEventBusImpl } from './typed-event-bus';
/**
 * Migration adapter that wraps a typed event bus to provide backward compatibility
 * with the legacy EventBus interface while enabling gradual migration to typed events.
 */
export class EventBusMigrationAdapter {
    constructor(typedEventBus) {
        this.typedEventBus = typedEventBus;
    }
    emit(event, data) {
        // Use typed event bus with legacy API
        this.typedEventBus.emit(event, data);
    }
    on(event, handler) {
        // Wrap handler to work with both typed and legacy events
        const wrappedHandler = (eventOrPayload) => {
            // If it's already in EventPayload format, use as-is
            if ('type' in eventOrPayload &&
                'data' in eventOrPayload &&
                'timestamp' in eventOrPayload &&
                'source' in eventOrPayload) {
                handler(eventOrPayload);
            }
            else {
                // Convert typed event to legacy format
                const payload = {
                    type: eventOrPayload.type || event,
                    data: eventOrPayload.data,
                    timestamp: eventOrPayload.timestamp || Date.now(),
                    source: eventOrPayload.source || 'unknown',
                };
                handler(payload);
            }
        };
        return this.typedEventBus.on(event, wrappedHandler);
    }
    off(event, handler) {
        // Note: This might not work perfectly due to handler wrapping
        // In practice, users should use the returned unsubscribe function
        this.typedEventBus.off(event, handler);
    }
    once(event, handler) {
        const wrappedHandler = (eventOrPayload) => {
            if ('type' in eventOrPayload &&
                'data' in eventOrPayload &&
                'timestamp' in eventOrPayload &&
                'source' in eventOrPayload) {
                handler(eventOrPayload);
            }
            else {
                const payload = {
                    type: eventOrPayload.type || event,
                    data: eventOrPayload.data,
                    timestamp: eventOrPayload.timestamp || Date.now(),
                    source: eventOrPayload.source || 'unknown',
                };
                handler(payload);
            }
        };
        this.typedEventBus.once(event, wrappedHandler);
    }
    /**
     * Get access to the underlying typed event bus for gradual migration
     */
    get typed() {
        return this.typedEventBus;
    }
}
/**
 * Extended migration adapter with typed property
 */
class ExtendedMigrationAdapter extends EventBusMigrationAdapter {
    // Override the getter to make it public
    get typed() {
        return super.typed;
    }
}
/**
 * Create a migration-ready event bus that supports both typed and untyped usage
 */
export function createMigrationEventBus(options) {
    const typedEventBus = new TypedEventBusImpl(options);
    const adapter = new ExtendedMigrationAdapter(typedEventBus);
    return adapter;
}
/**
 * Migration helper to analyze event usage in code
 */
export class EventUsageAnalyzer {
    constructor() {
        this.eventTypes = new Set();
        this.eventData = new Map();
    }
    /**
     * Track an event emission
     */
    trackEmit(eventType, data) {
        this.eventTypes.add(eventType);
        if (!this.eventData.has(eventType)) {
            this.eventData.set(eventType, []);
        }
        this.eventData.get(eventType).push(data);
    }
    /**
     * Get all tracked event types
     */
    getEventTypes() {
        return Array.from(this.eventTypes).sort();
    }
    /**
     * Get sample data for an event type
     */
    getSampleData(eventType) {
        return this.eventData.get(eventType) || [];
    }
    /**
     * Generate TypeScript type definitions based on tracked events
     */
    generateTypeDefinitions() {
        const types = ['export type AppEventMap = {'];
        for (const eventType of this.getEventTypes()) {
            const samples = this.getSampleData(eventType);
            const typeStr = this.inferTypeFromSamples(samples);
            types.push(`  '${eventType}': ${typeStr};`);
        }
        types.push('};');
        return types.join('\n');
    }
    inferTypeFromSamples(samples) {
        if (samples.length === 0)
            return 'unknown';
        // Simple type inference - in production, use a more sophisticated approach
        const sample = samples[0];
        if (sample === null)
            return 'null';
        if (sample === undefined)
            return 'undefined';
        if (typeof sample === 'string')
            return 'string';
        if (typeof sample === 'number')
            return 'number';
        if (typeof sample === 'boolean')
            return 'boolean';
        if (Array.isArray(sample)) {
            return 'unknown[]';
        }
        if (typeof sample === 'object') {
            const props = [];
            for (const [key, value] of Object.entries(sample)) {
                const valueType = typeof value === 'object' ? 'unknown' : typeof value;
                props.push(`${key}: ${valueType}`);
            }
            return `{ ${props.join('; ')} }`;
        }
        return 'unknown';
    }
    /**
     * Reset tracked data
     */
    reset() {
        this.eventTypes.clear();
        this.eventData.clear();
    }
}
/**
 * Development-time event bus wrapper that tracks usage
 */
export function createAnalyzingEventBus(eventBus, analyzer) {
    return {
        emit: (event, data) => {
            analyzer.trackEmit(event, data);
            eventBus.emit(event, data);
        },
        on: (event, handler) => eventBus.on(event, handler),
        off: (event, handler) => eventBus.off(event, handler),
        once: (event, handler) => eventBus.once(event, handler),
    };
}
/**
 * Migration guide generator
 */
export function generateMigrationGuide(analyzer) {
    const eventTypes = analyzer.getEventTypes();
    return `
# Event Bus Migration Guide

## Discovered Event Types

The following event types were discovered in your application:

${eventTypes.map((type) => `- \`${type}\``).join('\n')}

## Step 1: Create Your Event Map

Add the following type definition to your codebase:

\`\`\`typescript
${analyzer.generateTypeDefinitions()}
\`\`\`

## Step 2: Update Your Event Bus Creation

Replace:
\`\`\`typescript
const eventBus = createEventBus();
\`\`\`

With:
\`\`\`typescript
import { createTypedEventBus } from '@mfe-toolkit/core';
import type { AppEventMap } from './types/events';

const eventBus = createTypedEventBus<AppEventMap>();
\`\`\`

## Step 3: Migrate Event Emissions

Replace untyped emissions:
\`\`\`typescript
eventBus.emit('user:login', { userId: '123' });
\`\`\`

With typed emissions:
\`\`\`typescript
eventBus.emit('user:login', { userId: '123', username: 'john', roles: ['user'] });
\`\`\`

## Step 4: Migrate Event Handlers

Replace untyped handlers:
\`\`\`typescript
eventBus.on('user:login', (payload) => {
  console.log(payload.data.userId); // No type safety
});
\`\`\`

With typed handlers:
\`\`\`typescript
eventBus.on('user:login', (event) => {
  console.log(event.data.userId); // Type safe!
});
\`\`\`
`;
}
