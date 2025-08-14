import type { EventBus, EventPayload } from '../types';
import type { TypedEventBus, TypedEventBusOptions } from './typed-event-bus';
import { TypedEventBusImpl } from './typed-event-bus';
import type { EventMap, MFEEventMap, BaseEvent } from '../types/events';

/**
 * Migration adapter that wraps a typed event bus to provide backward compatibility
 * with the legacy EventBus interface while enabling gradual migration to typed events.
 */
export class EventBusMigrationAdapter<TEventMap extends EventMap = MFEEventMap>
  implements EventBus
{
  constructor(private typedEventBus: TypedEventBus<TEventMap>) {}

  emit<T = any>(event: string, data: T): void {
    // Use typed event bus with legacy API
    this.typedEventBus.emit(event, data);
  }

  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void {
    // Wrap handler to work with both typed and legacy events
    const wrappedHandler = (eventOrPayload: BaseEvent | EventPayload<T>) => {
      // If it's already in EventPayload format, use as-is
      if (
        'type' in eventOrPayload &&
        'data' in eventOrPayload &&
        'timestamp' in eventOrPayload &&
        'source' in eventOrPayload
      ) {
        handler(eventOrPayload as EventPayload<T>);
      } else {
        // Convert typed event to legacy format
        const payload: EventPayload<T> = {
          type: (eventOrPayload as any).type || event,
          data: (eventOrPayload as any).data,
          timestamp: (eventOrPayload as any).timestamp || Date.now(),
          source: (eventOrPayload as any).source || 'unknown',
        };
        handler(payload);
      }
    };

    return this.typedEventBus.on(event as any, wrappedHandler);
  }

  off(event: string, handler: (payload: EventPayload<any>) => void): void {
    this.typedEventBus.off(event, handler);
  }

  once<T = any>(event: string, handler: (payload: EventPayload<T>) => void): void {
    const wrappedHandler = (eventOrPayload: BaseEvent | EventPayload<T>) => {
      if (
        'type' in eventOrPayload &&
        'data' in eventOrPayload &&
        'timestamp' in eventOrPayload &&
        'source' in eventOrPayload
      ) {
        handler(eventOrPayload as EventPayload<T>);
      } else {
        const payload: EventPayload<T> = {
          type: (eventOrPayload as any).type || event,
          data: (eventOrPayload as any).data,
          timestamp: (eventOrPayload as any).timestamp || Date.now(),
          source: (eventOrPayload as any).source || 'unknown',
        };
        handler(payload);
      }
    };

    this.typedEventBus.once(event as any, wrappedHandler);
  }

  /**
   * Get access to the underlying typed event bus for gradual migration
   */
  get typed(): TypedEventBus<TEventMap> {
    return this.typedEventBus;
  }
}

/**
 * Extended migration adapter with typed property
 */
class ExtendedMigrationAdapter<TEventMap extends EventMap = MFEEventMap>
  extends EventBusMigrationAdapter<TEventMap>
  implements EventBus
{
  // Override the getter to make it public
  get typed(): TypedEventBus<TEventMap> {
    return super.typed;
  }
}

/**
 * Create a migration-ready event bus that supports both typed and untyped usage
 */
export function createMigrationEventBus<TEventMap extends EventMap = MFEEventMap>(
  options?: TypedEventBusOptions<TEventMap>
): EventBus & { typed: TypedEventBus<TEventMap> } {
  const typedEventBus = new TypedEventBusImpl<TEventMap>(options);
  const adapter = new ExtendedMigrationAdapter(typedEventBus);

  return adapter as EventBus & { typed: TypedEventBus<TEventMap> };
}

/**
 * Migration helper to analyze event usage in code
 */
export class EventUsageAnalyzer {
  private eventTypes = new Set<string>();
  private eventData = new Map<string, any[]>();

  /**
   * Track an event emission
   */
  trackEmit(eventType: string, data: any): void {
    this.eventTypes.add(eventType);

    if (!this.eventData.has(eventType)) {
      this.eventData.set(eventType, []);
    }
    this.eventData.get(eventType)!.push(data);
  }

  /**
   * Get all tracked event types
   */
  getEventTypes(): string[] {
    return Array.from(this.eventTypes).sort();
  }

  /**
   * Get sample data for an event type
   */
  getSampleData(eventType: string): any[] {
    return this.eventData.get(eventType) || [];
  }

  /**
   * Generate TypeScript type definitions based on tracked events
   */
  generateTypeDefinitions(): string {
    const types: string[] = ['export type AppEventMap = {'];

    for (const eventType of this.getEventTypes()) {
      const samples = this.getSampleData(eventType);
      const typeStr = this.inferTypeFromSamples(samples);
      types.push(`  '${eventType}': ${typeStr};`);
    }

    types.push('};');
    return types.join('\n');
  }

  private inferTypeFromSamples(samples: any[]): string {
    if (samples.length === 0) return 'unknown';

    const sample = samples[0];

    if (sample === null) return 'null';
    if (sample === undefined) return 'undefined';
    if (typeof sample === 'string') return 'string';
    if (typeof sample === 'number') return 'number';
    if (typeof sample === 'boolean') return 'boolean';

    if (Array.isArray(sample)) {
      return 'unknown[]';
    }

    if (typeof sample === 'object') {
      const props: string[] = [];
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
  reset(): void {
    this.eventTypes.clear();
    this.eventData.clear();
  }
}

/**
 * Development-time event bus wrapper that tracks usage
 */
export function createAnalyzingEventBus(
  eventBus: EventBus,
  analyzer: EventUsageAnalyzer
): EventBus {
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
export function generateMigrationGuide(analyzer: EventUsageAnalyzer): string {
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
