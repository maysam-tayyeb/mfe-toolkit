import React, { useState, useEffect, useRef } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type ReceivedEvent = {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  isNew?: boolean;
};

type EventSubscriberProps = {
  services: MFEServices;
};

const MAX_EVENTS = 10;

export const EventSubscriber: React.FC<EventSubscriberProps> = ({ services }) => {
  const [events, setEvents] = useState<ReceivedEvent[]>([]);
  const [receivedCount, setReceivedCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'listening'>('connected');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const eventContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    const addEvent = (type: string, data: any) => {
      const newEvent: ReceivedEvent = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        data,
        timestamp: new Date().toLocaleTimeString(),
        isNew: true
      };

      setEvents(prev => {
        const updated = [newEvent, ...prev].slice(0, MAX_EVENTS);
        
        setTimeout(() => {
          setEvents(current => 
            current.map(e => e.id === newEvent.id ? { ...e, isNew: false } : e)
          );
        }, 500);
        
        return updated;
      });
      
      setReceivedCount(prev => prev + 1);
      setConnectionStatus('listening');
      setTimeout(() => setConnectionStatus('connected'), 200);
      
      services.logger.info(`[Subscriber] Received event: ${type}`, data);
    };

    subscriptions.push(
      services.eventBus.on('chat:message', (payload) => {
        addEvent('chat:message', payload.data);
        // Show notification for chat messages
        if (services.notifications) {
          services.notifications.addNotification({
            type: 'info',
            title: 'New Message',
            message: payload.data?.text || 'New message received'
          });
        }
      })
    );

    subscriptions.push(
      services.eventBus.on('chat:reaction', (payload) => {
        addEvent('chat:reaction', payload.data);
      })
    );

    subscriptions.push(
      services.eventBus.on('chat:typing', (payload) => {
        const { user, isTyping: typing } = payload.data;
        
        if (typing) {
          setIsTyping(true);
          setTypingUser(user);
          
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        } else {
          setIsTyping(false);
          setTypingUser(null);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      })
    );

    subscriptions.push(
      services.eventBus.on('system:alert', (payload) => {
        addEvent('system:alert', payload.data);
      })
    );

    subscriptions.push(
      services.eventBus.on('system:error', (payload) => {
        addEvent('system:error', payload.data);
        // Show notification for errors
        if (services.notifications) {
          services.notifications.addNotification({
            type: 'error',
            title: 'System Error Received',
            message: payload.data?.message || 'An error event was received'
          });
        }
      })
    );

    subscriptions.push(
      services.eventBus.on('user:login', (payload) => {
        addEvent('user:login', payload.data);
        // Show notification for user login
        if (services.notifications) {
          services.notifications.addNotification({
            type: 'info',
            title: 'User Login Event',
            message: `User ${payload.data?.username || 'unknown'} logged in`
          });
        }
      })
    );

    subscriptions.push(
      services.eventBus.on('state:update', (payload) => {
        addEvent('state:update', payload.data);
      })
    );

    subscriptions.push(
      services.eventBus.on('custom:event', (payload) => {
        addEvent('custom:event', payload.data);
      })
    );

    services.eventBus.emit('mfe:ready', { 
      name: 'event-subscriber',
      capabilities: ['receive', 'display']
    });

    services.eventBus.emit('user:seen', { 
      timestamp: Date.now()
    });

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      services.eventBus.emit('mfe:unloaded', { 
        name: 'event-subscriber'
      });
    };
  }, [services]); // Remove receivedCount from dependencies to prevent re-mounting

  const getEventIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'chat:message': '💬',
      'chat:reaction': '👍',
      'chat:typing': '⌨️',
      'system:alert': '🔔',
      'system:error': '❌',
      'user:login': '👤',
      'state:update': '🔄',
      'custom:event': '⚡'
    };
    return iconMap[type] || '📦';
  };

  const getEventColor = (type: string) => {
    if (type.startsWith('chat:')) return 'ds-alert-info';
    if (type.startsWith('system:error')) return 'ds-alert-danger';
    if (type.startsWith('system:')) return 'ds-alert-warning';
    if (type.startsWith('user:')) return 'ds-alert-success';
    return 'ds-alert';
  };

  const formatEventData = (data: any) => {
    if (typeof data === 'string') return data;
    if (data.text) return data.text;
    if (data.message) return data.message;
    if (data.emoji) return `Reaction: ${data.emoji}`;
    if (data.username) return `User: ${data.username}`;
    if (data.component) return `Component: ${data.component}`;
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">📻 Event Subscriber</h4>
        <div className="ds-flex ds-gap-2">
          <span className="ds-badge-info">📬 Received: {receivedCount}</span>
          {connectionStatus === 'listening' && (
            <span className="ds-badge-success ds-animate-pulse">🎧 Listening</span>
          )}
        </div>
      </div>

      {isTyping && typingUser && (
        <div className="ds-alert-warning ds-mb-3 ds-animate-in">
          <span className="ds-animate-pulse">⌨️ {typingUser} is typing...</span>
        </div>
      )}

      <div 
        ref={eventContainerRef}
        className="ds-space-y-2 ds-max-h-64 ds-overflow-y-auto ds-mb-3"
      >
        {events.length === 0 ? (
          <div className="ds-empty-state ds-py-8 ds-text-center">
            <p className="ds-text-muted ds-text-sm">📡 Waiting for events...</p>
            <p className="ds-text-xs ds-text-muted ds-mt-1">
              Events will appear here when received
            </p>
          </div>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className={`
                ${getEventColor(event.type)} 
                ds-p-2 ds-rounded ds-text-sm
                ${event.isNew ? 'ds-animate-in ds-ring-2 ds-ring-accent-primary' : ''}
              `}
            >
              <div className="ds-flex ds-justify-between ds-items-start ds-mb-1">
                <span className="ds-font-medium">
                  {getEventIcon(event.type)} {event.type}
                </span>
                <span className="ds-text-xs ds-text-muted">{event.timestamp}</span>
              </div>
              <div className="ds-text-xs ds-break-words">
                {formatEventData(event.data)}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="ds-border-t ds-pt-2">
        <div className="ds-text-xs ds-text-muted ds-space-y-1">
          <p>📡 Subscribed to events:</p>
          <div className="ds-flex ds-flex-wrap ds-gap-1">
            {['chat:*', 'system:*', 'user:*', 'state:*', 'custom:*'].map(pattern => (
              <span key={pattern} className="ds-badge ds-badge-sm">{pattern}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};