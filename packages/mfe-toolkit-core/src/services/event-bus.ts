import { EventBus } from '../types';
import { createTypedEventBus } from './typed-event-bus';

/**
 * Create an event bus instance with typed events
 *
 * @param options - Configuration options
 * @param options.source - Source identifier for events
 * @param options.debug - Enable debug logging
 * @returns EventBus instance with typed implementation
 */
export const createEventBus = (options?: { source?: string; debug?: boolean }): EventBus => {
  // Return typed event bus that implements the EventBus interface
  return createTypedEventBus({
    source: options?.source || 'mfe-platform',
    debug: options?.debug || false,
  });
};