/**
 * Typed Event System for MFE Platform
 *
 * This module provides type-safe event definitions and utilities for the MFE event bus.
 * It uses TypeScript discriminated unions to ensure compile-time type safety.
 */
// ============================================================================
// Event Utilities
// ============================================================================
/**
 * Type guard to check if an event matches a specific type
 */
export function isEventType(event, type, _eventMap) {
    return event.type === type;
}
/**
 * Create a typed event payload
 */
export function createEvent(type, data, source, options) {
    return {
        type,
        data,
        timestamp: Date.now(),
        source,
        ...options,
    };
}
/**
 * Event namespace utilities
 */
export const EventNamespace = {
    /**
     * Check if an event belongs to a namespace
     */
    matches(eventType, namespace) {
        return eventType.startsWith(`${namespace}:`);
    },
    /**
     * Extract namespace from event type
     */
    extract(eventType) {
        const colonIndex = eventType.indexOf(':');
        return colonIndex > 0 ? eventType.substring(0, colonIndex) : null;
    },
    /**
     * Create a namespaced event type
     */
    create(namespace, eventName) {
        return `${namespace}:${eventName}`;
    },
};
/**
 * Create a validator for an event map
 */
export function createEventValidator(schema) {
    return (event) => {
        const validator = schema[event.type];
        if (!validator) {
            // No validator defined, allow any event
            return true;
        }
        return validator(event.data);
    };
}
/**
 * Convert legacy event to typed event (if possible)
 */
export function fromLegacyEvent(event, eventMap) {
    // If the event type exists in the event map, return as typed
    if (eventMap && event.type in eventMap) {
        return event;
    }
    // Otherwise, return as legacy
    return event;
}
/**
 * Type guard for checking if an event is typed
 */
export function isTypedEvent(event, eventMap) {
    return event.type in eventMap;
}
