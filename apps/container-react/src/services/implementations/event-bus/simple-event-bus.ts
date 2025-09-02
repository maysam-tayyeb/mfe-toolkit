/**
 * Simple Event Bus Implementation
 * Re-exports the event bus implementation from @mfe-toolkit/core
 */

// Re-export the implementation from core
export { createEventBus, SimpleEventBus, EventFlowDebugger } from '@mfe-toolkit/core';
export type { EventBus } from '@mfe-toolkit/core';

// Alias for backward compatibility
export { createEventBus as createSimpleEventBus } from '@mfe-toolkit/core';
