import { createEvent as createEventUtil } from '../types/events';
/**
 * Implementation of typed event bus
 */
export class TypedEventBusImpl {
    constructor(options = {}) {
        this.options = options;
        this.handlers = new Map();
        this.wildcardHandlers = new Set();
        this.stats = {
            totalEvents: 0,
            eventCounts: {},
            handlerCounts: {},
            wildcardHandlers: 0,
            errors: 0,
        };
        this.updateWildcardStats();
    }
    emit(type, data, options) {
        // Create event payload
        const event = createEventUtil(type, data, this.options.source || 'unknown', options);
        // Update statistics
        this.stats.totalEvents++;
        this.stats.eventCounts[type] = (this.stats.eventCounts[type] || 0) + 1;
        // Apply interceptors
        let processedEvent = event;
        if (this.options.interceptors) {
            for (const interceptor of this.options.interceptors) {
                if (interceptor.beforeEmit) {
                    const result = interceptor.beforeEmit(processedEvent);
                    if (result === null) {
                        // Event cancelled by interceptor
                        this.debug(`Event ${type} cancelled by interceptor`);
                        return;
                    }
                    processedEvent = result;
                }
            }
        }
        // Validate event if schema is provided
        if (this.options.schema && type in this.options.schema) {
            const validator = this.options.schema[type];
            if (validator && !validator(data)) {
                this.handleError(new Error(`Invalid event data for type: ${type}`), processedEvent);
                return;
            }
        }
        // Debug logging
        this.debug(`Emitting event: ${type}`, processedEvent);
        // Emit to specific handlers
        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.forEach((handler) => {
                this.invokeHandler(handler, processedEvent);
            });
        }
        // Emit to wildcard handlers
        this.wildcardHandlers.forEach((handler) => {
            this.invokeHandler(handler, processedEvent);
        });
        // After emit interceptors
        if (this.options.interceptors) {
            for (const interceptor of this.options.interceptors) {
                if (interceptor.afterEmit) {
                    interceptor.afterEmit(processedEvent);
                }
            }
        }
    }
    on(type, handler) {
        // Handle wildcard subscription
        if (type === '*') {
            this.wildcardHandlers.add(handler);
            this.updateWildcardStats();
            return () => {
                this.wildcardHandlers.delete(handler);
                this.updateWildcardStats();
            };
        }
        // Handle specific event subscription
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        const handlers = this.handlers.get(type);
        handlers.add(handler);
        this.updateHandlerStats();
        return () => this.off(type, handler);
    }
    off(type, handler) {
        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.handlers.delete(type);
            }
            this.updateHandlerStats();
        }
    }
    once(type, handler) {
        const onceHandler = (event) => {
            handler(event);
            this.off(type, onceHandler);
        };
        this.on(type, onceHandler);
    }
    async waitFor(type, options = {}) {
        return new Promise((resolve, reject) => {
            const timeoutMs = options.timeout || 30000;
            const timeoutId = setTimeout(() => {
                unsubscribe();
                reject(new Error(`Timeout waiting for event: ${type}`));
            }, timeoutMs);
            const handler = (event) => {
                if (!options.filter || options.filter(event)) {
                    clearTimeout(timeoutId);
                    resolve(event);
                }
            };
            const unsubscribe = this.on(type, handler);
        });
    }
    getStats() {
        return { ...this.stats };
    }
    clear() {
        this.handlers.clear();
        this.wildcardHandlers.clear();
        this.stats = {
            totalEvents: 0,
            eventCounts: {},
            handlerCounts: {},
            wildcardHandlers: 0,
            errors: 0,
        };
    }
    invokeHandler(handler, event) {
        try {
            // Apply before handle interceptors
            if (this.options.interceptors) {
                for (const interceptor of this.options.interceptors) {
                    if (interceptor.beforeHandle) {
                        const shouldContinue = interceptor.beforeHandle(event, handler);
                        if (!shouldContinue) {
                            return;
                        }
                    }
                }
            }
            // Convert to legacy format for backward compatibility
            const legacyPayload = {
                type: event.type,
                data: event.data,
                timestamp: event.timestamp,
                source: event.source,
            };
            // Invoke handler with legacy format for compatibility
            handler(legacyPayload);
            // Apply after handle interceptors
            if (this.options.interceptors) {
                for (const interceptor of this.options.interceptors) {
                    if (interceptor.afterHandle) {
                        interceptor.afterHandle(event, handler);
                    }
                }
            }
        }
        catch (error) {
            this.handleError(error, event);
            // Apply after handle interceptors with error
            if (this.options.interceptors) {
                for (const interceptor of this.options.interceptors) {
                    if (interceptor.afterHandle) {
                        interceptor.afterHandle(event, handler, error);
                    }
                }
            }
        }
    }
    handleError(error, event) {
        this.stats.errors++;
        if (this.options.onError) {
            this.options.onError(error, event);
        }
        else {
            console.error(`Error in event handler for ${event.type}:`, error);
        }
    }
    debug(message, ...args) {
        if (this.options.debug) {
            console.warn(`[EventBus] ${message}`, ...args);
        }
    }
    updateHandlerStats() {
        this.stats.handlerCounts = {};
        this.handlers.forEach((handlers, type) => {
            this.stats.handlerCounts[type] = handlers.size;
        });
    }
    updateWildcardStats() {
        this.stats.wildcardHandlers = this.wildcardHandlers.size;
    }
}
/**
 * Create a typed event bus with default MFE event map
 */
export function createTypedEventBus(options) {
    return new TypedEventBusImpl(options);
}
/**
 * Create a typed event bus with custom event map
 */
export function createCustomEventBus(options) {
    return new TypedEventBusImpl(options);
}
