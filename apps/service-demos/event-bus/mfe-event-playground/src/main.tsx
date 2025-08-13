import { createSignal, createEffect, onCleanup, For } from 'solid-js';
import { render } from 'solid-js/web';
import type { EventBus } from '@mfe-toolkit/core';

interface MFEServices {
  eventBus: EventBus;
  logger?: {
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
  };
}

function EventPlayground(props: { services: MFEServices }) {
  const { eventBus, logger } = props.services;
  
  // Signals for state management
  const [eventName, setEventName] = createSignal('playground:test');
  const [payloadText, setPayloadText] = createSignal('{"message": "Hello from Solid.js!"}');
  const [listeningTo, setListeningTo] = createSignal<string[]>([]);
  const [newListener, setNewListener] = createSignal('');
  const [isValidJson, setIsValidJson] = createSignal(true);
  
  // Store subscription cleanup functions
  const subscriptions = new Map<string, () => void>();
  
  // Validate JSON payload
  createEffect(() => {
    try {
      JSON.parse(payloadText());
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  });
  
  // Send event
  const sendEvent = () => {
    if (!isValidJson()) {
      logger?.warn('Invalid JSON payload');
      return;
    }
    
    try {
      const payload = JSON.parse(payloadText());
      const name = eventName();
      
      eventBus.emit(name, payload);
      logger?.info(`Sent event: ${name}`, payload);
    } catch (error) {
      logger?.error('Failed to send event', error);
    }
  };
  
  // Subscribe to an event
  const subscribeToEvent = (eventToListen: string) => {
    if (subscriptions.has(eventToListen)) {
      logger?.warn(`Already listening to: ${eventToListen}`);
      return;
    }
    
    const unsubscribe = eventBus.on(eventToListen, (payload) => {
      logger?.info(`Received event: ${eventToListen}`, payload);
    });
    
    subscriptions.set(eventToListen, unsubscribe);
    setListeningTo(prev => [...prev, eventToListen]);
    logger?.info(`Started listening to: ${eventToListen}`);
  };
  
  // Unsubscribe from an event
  const unsubscribeFromEvent = (eventToStop: string) => {
    const unsubscribe = subscriptions.get(eventToStop);
    if (unsubscribe) {
      unsubscribe();
      subscriptions.delete(eventToStop);
      setListeningTo(prev => prev.filter(e => e !== eventToStop));
      logger?.info(`Stopped listening to: ${eventToStop}`);
    }
  };
  
  // Add new listener
  const addListener = () => {
    const listener = newListener().trim();
    if (listener && !listeningTo().includes(listener)) {
      subscribeToEvent(listener);
      setNewListener('');
    }
  };
  
  // Cleanup on unmount
  onCleanup(() => {
    subscriptions.forEach(unsubscribe => unsubscribe());
    subscriptions.clear();
  });
  
  // Subscribe to some default events
  createEffect(() => {
    subscribeToEvent('playground:*');
    subscribeToEvent('system:*');
  });
  
  return (
    <div class="ds-flex ds-flex-col ds-gap-4">
      {/* Header */}
      <div class="ds-card-padded">
        <h2 class="ds-section-title ds-mb-2">🎮 Event Bus Playground</h2>
        <p class="ds-text-muted">
          Interactive event bus testing powered by Solid.js
        </p>
      </div>
      
      {/* Event Emitter */}
      <div class="ds-card-padded">
        <h3 class="ds-card-title ds-mb-3">📤 Event Emitter</h3>
        
        <div class="ds-flex ds-flex-col ds-gap-3">
          <div>
            <label class="ds-label">Event Name</label>
            <input
              type="text"
              class="ds-input"
              value={eventName()}
              onInput={(e) => setEventName(e.currentTarget.value)}
              placeholder="e.g., playground:test"
            />
          </div>
          
          <div>
            <label class="ds-label">
              Payload (JSON)
              {!isValidJson() && (
                <span class="ds-text-danger ds-ml-2">Invalid JSON</span>
              )}
            </label>
            <textarea
              class="ds-textarea"
              rows="4"
              value={payloadText()}
              onInput={(e) => setPayloadText(e.currentTarget.value)}
              placeholder='{"message": "Hello World"}'
            />
          </div>
          
          <button
            class="ds-btn-primary"
            onClick={sendEvent}
            disabled={!isValidJson()}
          >
            Send Event
          </button>
        </div>
      </div>
      
      {/* Event Listeners */}
      <div class="ds-card-padded">
        <h3 class="ds-card-title ds-mb-3">📥 Event Listeners</h3>
        
        <div class="ds-flex ds-flex-col ds-gap-3">
          <div class="ds-flex ds-gap-2">
            <input
              type="text"
              class="ds-input ds-flex-1"
              value={newListener()}
              onInput={(e) => setNewListener(e.currentTarget.value)}
              placeholder="Event name to listen for..."
              onKeyDown={(e) => e.key === 'Enter' && addListener()}
            />
            <button
              class="ds-btn-secondary"
              onClick={addListener}
              disabled={!newListener().trim()}
            >
              Add Listener
            </button>
          </div>
          
          {listeningTo().length > 0 ? (
            <div class="ds-flex ds-flex-wrap ds-gap-2">
              <For each={listeningTo()}>
                {(listener) => (
                  <div class="ds-badge ds-badge-info ds-flex ds-items-center ds-gap-1">
                    <span>{listener}</span>
                    <button
                      class="ds-text-xs ds-opacity-70 ds-hover:opacity-100"
                      onClick={() => unsubscribeFromEvent(listener)}
                      aria-label={`Stop listening to ${listener}`}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </For>
            </div>
          ) : (
            <p class="ds-text-muted ds-text-sm">No active listeners</p>
          )}
        </div>
      </div>
      
      {/* Solid.js Badge */}
      <div class="ds-text-center ds-text-sm ds-text-muted">
        Powered by <span class="ds-badge ds-badge-info">Solid.js MFE</span>
      </div>
    </div>
  );
}

// MFE Module Export
let cleanup: (() => void) | null = null;

export default {
  mount: (container: HTMLElement, services: MFEServices) => {
    if (!services?.eventBus) {
      console.error('Event Bus service is required');
      return;
    }
    
    cleanup = render(() => <EventPlayground services={services} />, container);
    services.logger?.info('Event Playground MFE mounted (Solid.js)');
  },
  
  unmount: () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  }
};