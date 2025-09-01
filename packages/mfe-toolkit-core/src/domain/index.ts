/**
 * Domain Types
 * 
 * Central location for domain-specific types and data structures.
 * These are data/configuration types, not service interfaces.
 */

// MFE Manifest types
export type {
  MFEManifest,
  MFERegistry,
  MFEDependencies,
  MFECompatibility,
  MFECapabilities,
  MFERequirements,
  MFEMetadata,
  MFEConfig,
  MFESecurity,
  MFELifecycle,
} from './manifest';

// Event system types
export type {
  BaseEvent,
  EventMap,
  EventType,
  EventData,
  TypedEvent,
  MFEEventMap,
  MFEEvent,
  MFEEventType,
  EventValidator,
  EventSchema,
  LegacyEvent,
} from './events';

export {
  isEventType,
  createEvent,
  EventNamespace,
  createEventValidator,
  fromLegacyEvent,
  isTypedEvent,
} from './events';

// State management types
export type { StateManager } from './state';