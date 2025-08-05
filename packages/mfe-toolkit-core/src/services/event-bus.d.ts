import { EventBus } from '../types';
/**
 * Create an event bus instance
 *
 * @param options - Configuration options
 * @param options.source - Source identifier for events
 * @param options.debug - Enable debug logging
 * @returns EventBus instance with typed implementation
 */
export declare const createEventBus: (options?: {
    source?: string;
    debug?: boolean;
}) => EventBus;
//# sourceMappingURL=event-bus.d.ts.map