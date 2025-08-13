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
  const [eventCount, setEventCount] = createSignal(0);
  
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
      setEventCount(prev => prev + 1);
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
      setEventCount(prev => prev + 1);
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
    <div class="ds-p-4">
      <div class="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 class="ds-card-title ds-mb-0">🎮 Event Bus Playground</h4>
        <div class="ds-flex ds-gap-2">
          <span class="ds-badge ds-badge-info">Events: {eventCount()}</span>
          <span class="ds-badge ds-badge-success">Solid.js MFE</span>
        </div>
      </div>

      <div class="ds-grid ds-grid-cols-2 ds-gap-4">
        {/* Event Emitter */}
        <div class="ds-p-3 ds-border ds-rounded-lg">
          <h5 class="ds-text-sm ds-font-semibold ds-mb-3">📤 Event Emitter</h5>
          
          <div class="ds-space-y-3">
            <div>
              <label class="ds-text-xs ds-text-muted ds-block ds-mb-1">Event Name</label>
              <input
                type="text"
                class="ds-input ds-input-sm"
                value={eventName()}
                onInput={(e) => setEventName(e.currentTarget.value)}
                placeholder="e.g., playground:test"
              />
            </div>
            
            <div>
              <label class="ds-text-xs ds-text-muted ds-block ds-mb-1">
                Payload (JSON)
                {!isValidJson() && (
                  <span class="ds-text-danger ds-ml-2">Invalid JSON</span>
                )}
              </label>
              <textarea
                class="ds-textarea ds-textarea-sm"
                rows="3"
                value={payloadText()}
                onInput={(e) => setPayloadText(e.currentTarget.value)}
                placeholder='{"message": "Hello World"}'
              />
            </div>
            
            <button
              class="ds-btn-primary ds-btn-sm ds-w-full"
              onClick={sendEvent}
              disabled={!isValidJson()}
            >
              Send Event
            </button>
          </div>
        </div>
        
        {/* Event Listeners */}
        <div class="ds-p-3 ds-border ds-rounded-lg">
          <h5 class="ds-text-sm ds-font-semibold ds-mb-3">📥 Event Listeners</h5>
          
          <div class="ds-space-y-3">
            <div>
              <label class="ds-text-xs ds-text-muted ds-block ds-mb-1">Add Listener</label>
              <div class="ds-flex ds-gap-2">
                <input
                  type="text"
                  class="ds-input ds-input-sm ds-flex-1"
                  value={newListener()}
                  onInput={(e) => setNewListener(e.currentTarget.value)}
                  placeholder="Event pattern..."
                  onKeyDown={(e) => e.key === 'Enter' && addListener()}
                />
                <button
                  class="ds-btn-secondary ds-btn-sm"
                  onClick={addListener}
                  disabled={!newListener().trim()}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div>
              <label class="ds-text-xs ds-text-muted ds-block ds-mb-1">Active Listeners</label>
              {listeningTo().length > 0 ? (
                <div class="ds-flex ds-flex-wrap ds-gap-1">
                  <For each={listeningTo()}>
                    {(listener) => (
                      <div class="ds-badge ds-badge-sm ds-badge-info ds-flex ds-items-center ds-gap-1">
                        <span class="ds-text-xs">{listener}</span>
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
                <p class="ds-text-muted ds-text-xs">No active listeners</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div class="ds-mt-4 ds-p-3 ds-bg-accent-primary-soft ds-rounded ds-text-xs">
        <p class="ds-text-center">
          💡 <strong>Tip:</strong> Events are displayed in the container's Event Log below. 
          Use this playground to test event patterns and payloads.
        </p>
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