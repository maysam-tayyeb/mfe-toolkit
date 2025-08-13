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

interface EventEntry {
  id: string;
  timestamp: string;
  eventName: string;
  payload: any;
  source: 'sent' | 'received';
}

function EventPlayground(props: { services: MFEServices }) {
  const { eventBus, logger } = props.services;
  
  // Signals for state management
  const [eventName, setEventName] = createSignal('playground:test');
  const [payloadText, setPayloadText] = createSignal('{"message": "Hello from Solid.js!"}');
  const [events, setEvents] = createSignal<EventEntry[]>([]);
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
  
  // Add event to history
  const addEvent = (entry: EventEntry) => {
    setEvents(prev => {
      const newEvents = [entry, ...prev];
      return newEvents.slice(0, 50); // Keep last 50 events
    });
  };
  
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
      
      addEvent({
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        eventName: name,
        payload,
        source: 'sent'
      });
      
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
      addEvent({
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        eventName: eventToListen,
        payload,
        source: 'received'
      });
      
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
  
  // Clear events
  const clearEvents = () => {
    setEvents([]);
    logger?.info('Cleared event history');
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
      
      {/* Event History */}
      <div class="ds-card-padded">
        <div class="ds-flex ds-justify-between ds-items-center ds-mb-3">
          <h3 class="ds-card-title">📜 Event History</h3>
          <button
            class="ds-btn-outline ds-btn-sm"
            onClick={clearEvents}
            disabled={events().length === 0}
          >
            Clear
          </button>
        </div>
        
        {events().length > 0 ? (
          <div class="ds-space-y-2 ds-max-h-96 ds-overflow-y-auto">
            <For each={events()}>
              {(event) => (
                <div
                  class={`ds-p-3 ds-rounded ds-border ${
                    event.source === 'sent' 
                      ? 'ds-bg-accent-primary-soft ds-border-accent-primary' 
                      : 'ds-bg-accent-success-soft ds-border-accent-success'
                  }`}
                >
                  <div class="ds-flex ds-justify-between ds-items-start ds-mb-1">
                    <div class="ds-flex ds-items-center ds-gap-2">
                      <span class="ds-text-sm ds-font-semibold">
                        {event.source === 'sent' ? '📤 Sent' : '📥 Received'}
                      </span>
                      <span class="ds-text-sm ds-font-mono">{event.eventName}</span>
                    </div>
                    <span class="ds-text-xs ds-text-muted">{event.timestamp}</span>
                  </div>
                  <pre class="ds-text-xs ds-bg-surface ds-p-2 ds-rounded ds-overflow-x-auto">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
              )}
            </For>
          </div>
        ) : (
          <div class="ds-empty-state">
            <p class="ds-text-muted">No events yet. Send an event or add a listener!</p>
          </div>
        )}
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