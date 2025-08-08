import React, { useState, useEffect } from 'react';
import { useUI } from '@/contexts/UIContext';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { EventLog, EmptyState } from '@mfe/design-system-react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EventBusPage: React.FC = () => {
  const { addNotification } = useUI();
  const [events, setEvents] = useState<Array<{ timestamp: string; type: string; data: any }>>([]);
  const [eventType, setEventType] = useState('test-event');
  const [eventData, setEventData] = useState('{"message": "Hello from Event Bus"}');
  const services = getMFEServicesSingleton();

  useEffect(() => {
    const unsubscribe = services.eventBus.on('*', (type: string, data: any) => {
      setEvents(prev => [...prev, {
        timestamp: new Date().toISOString(),
        type,
        data
      }].slice(-50));
    });

    return () => unsubscribe();
  }, [services.eventBus]);

  const handleSendEvent = () => {
    try {
      const data = JSON.parse(eventData);
      services.eventBus.emit(eventType, data);
      addNotification({
        type: 'success',
        title: 'Event Sent',
        message: `Event "${eventType}" has been emitted`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Invalid JSON',
        message: 'Please enter valid JSON data'
      });
    }
  };

  const clearEvents = () => {
    setEvents([]);
    addNotification({
      type: 'info',
      title: 'Events Cleared',
      message: 'Event log has been cleared'
    });
  };

  return (
    <div className="ds-page">
      <div className="ds-section">
        <h1 className="ds-page-title">Event Bus Service</h1>
        <p className="ds-text-muted">Test inter-MFE communication through the event bus</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ds-card-padded">
          <h2 className="ds-section-title mb-4">Send Event</h2>
          <div className="space-y-4">
            <div>
              <label className="ds-label">Event Type</label>
              <input
                type="text"
                className="ds-input"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                placeholder="Enter event type"
              />
            </div>
            <div>
              <label className="ds-label">Event Data (JSON)</label>
              <textarea
                className="ds-textarea"
                rows={4}
                value={eventData}
                onChange={(e) => setEventData(e.target.value)}
                placeholder='{"key": "value"}'
              />
            </div>
            <Button onClick={handleSendEvent} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Event
            </Button>
          </div>
        </div>

        <div className="ds-card-padded">
          <div className="flex items-center justify-between mb-4">
            <h2 className="ds-section-title">Event Log</h2>
            <Button variant="ghost" size="sm" onClick={clearEvents}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {events.length === 0 ? (
            <EmptyState
              title="No Events"
              description="Send an event to see it appear here"
              icon={<MessageSquare className="h-8 w-8" />}
            />
          ) : (
            <EventLog
              events={events.map(e => ({
                ...e,
                timestamp: new Date(e.timestamp).toLocaleTimeString()
              }))}
              maxHeight="400px"
            />
          )}
        </div>
      </div>
    </div>
  );
};