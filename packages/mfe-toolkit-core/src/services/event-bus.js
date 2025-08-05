import { createMigrationEventBus } from './event-bus-migration';
/**
 * Create an event bus instance
 *
 * @param options - Configuration options
 * @param options.source - Source identifier for events
 * @param options.debug - Enable debug logging
 * @returns EventBus instance with typed implementation
 */
export const createEventBus = (options) => {
    // Always return migration adapter that supports both typed and untyped usage
    return createMigrationEventBus({
        source: options?.source || 'mfe-platform',
        debug: options?.debug || false,
    });
};
