/**
 * EventBus Service Package
 * 
 * This package provides the EventBus service for MFE Toolkit.
 * It extends the ServiceMap interface via TypeScript module augmentation.
 */

import type { EventBus } from './types';

// Module augmentation to extend ServiceMap
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    eventBus: EventBus;
  }
}

// Export types
export type { EventBus, EventPayload, EventHandler, EventBusConfig } from './types';

// Export implementation (tree-shakable)
export { SimpleEventBus, createEventBus, defaultEventBus } from './implementation';

// Export provider
export { eventBusServiceProvider } from './provider';

// Export service key constant
export const EVENT_BUS_SERVICE_KEY = 'eventBus';