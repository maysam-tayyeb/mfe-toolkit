import React, { useState, useEffect } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type EventPublisherProps = {
  services: MFEServices;
};

const eventPresets = [
  { 
    label: 'Send Message', 
    type: 'chat:message', 
    data: { text: 'Hello from Publisher!', timestamp: Date.now() },
    className: 'ds-btn-primary'
  },
  { 
    label: 'Send Alert', 
    type: 'system:alert', 
    data: { level: 'info', message: 'System update available' },
    className: 'ds-btn-secondary'
  },
  { 
    label: 'User Login', 
    type: 'user:login', 
    data: { userId: '123', username: 'john_doe', roles: ['user'] },
    className: 'ds-btn-outline'
  },
  { 
    label: 'Update State', 
    type: 'state:update', 
    data: { component: 'header', theme: 'dark' },
    className: 'ds-btn-outline'
  },
  {
    label: 'Send Reaction',
    type: 'chat:reaction',
    data: { emoji: '👍', messageId: 'msg-123' },
    className: 'ds-btn-outline'
  },
  {
    label: 'Trigger Error',
    type: 'system:error',
    data: { code: 500, message: 'Simulated error for testing' },
    className: 'ds-btn-danger'
  }
];

export const EventPublisher: React.FC<EventPublisherProps> = ({ services }) => {
  const [sentCount, setSentCount] = useState(0);
  const [customType, setCustomType] = useState('custom:event');
  const [customData, setCustomData] = useState('{"key": "value"}');
  const [isTyping, setIsTyping] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const sendEvent = (type: string, data: any) => {
    services.eventBus.emit(type, data);
    setSentCount(prev => prev + 1);
    const time = new Date().toLocaleTimeString();
    
    services.logger.info(`[Publisher] Sent event: ${type}`, data);
    
    // Always use notification service for feedback
    if (services.notifications) {
      services.notifications.addNotification({
        type: 'success',
        title: 'Event Sent',
        message: `${type} at ${time}`
      });
    }
  };

  const handleCustomSend = () => {
    try {
      const data = JSON.parse(customData);
      sendEvent(customType, data);
      services.notifications?.addNotification({
        type: 'success',
        title: 'Custom Event Sent',
        message: `Event "${customType}" emitted successfully`
      });
    } catch (error) {
      services.notifications?.addNotification({
        type: 'error',
        title: 'Invalid JSON',
        message: 'Please enter valid JSON data'
      });
    }
  };

  const handleTypingIndicator = () => {
    if (!isTyping) {
      setIsTyping(true);
      services.eventBus.emit('chat:typing', { user: 'Publisher', isTyping: true });
      
      setTimeout(() => {
        setIsTyping(false);
        services.eventBus.emit('chat:typing', { user: 'Publisher', isTyping: false });
      }, 3000);
    }
  };

  useEffect(() => {
    services.eventBus.emit('mfe:ready', { 
      name: 'event-publisher',
      capabilities: ['emit', 'custom-events']
    });

    return () => {
      services.eventBus.emit('mfe:unloaded', { 
        name: 'event-publisher',
        sentCount 
      });
    };
  }, [sentCount]);

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">📡 Event Publisher</h4>
        <div className="ds-flex ds-gap-2">
          <span className="ds-badge-success">📨 Sent: {sentCount}</span>
          {isTyping && (
            <span className="ds-badge-warning ds-animate-pulse">Typing...</span>
          )}
        </div>
      </div>


      <div className="ds-space-y-3">
        <div>
          <p className="ds-text-sm ds-text-muted ds-mb-2">Quick Actions:</p>
          <div className="ds-grid ds-grid-cols-2 ds-gap-2">
            {eventPresets.slice(0, 4).map((preset) => (
              <button
                key={preset.type}
                className={`${preset.className} ds-btn-sm`}
                onClick={() => sendEvent(preset.type, preset.data)}
                title={`Emit ${preset.type} event`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ds-grid ds-grid-cols-2 ds-gap-2">
          {eventPresets.slice(4).map((preset) => (
            <button
              key={preset.type}
              className={`${preset.className} ds-btn-sm`}
              onClick={() => sendEvent(preset.type, preset.data, false)}
              title={`Emit ${preset.type} event`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="ds-flex ds-gap-2">
          <button
            className="ds-btn-outline ds-btn-sm ds-flex-1"
            onClick={handleTypingIndicator}
            disabled={isTyping}
          >
            {isTyping ? '💬 Typing...' : '⌨️ Start Typing'}
          </button>
          <button
            className="ds-btn-outline ds-btn-sm ds-flex-1"
            onClick={() => setShowCustom(!showCustom)}
          >
            {showCustom ? '➖ Hide Custom' : '➕ Custom Event'}
          </button>
        </div>

        {showCustom && (
          <div className="ds-border ds-rounded ds-p-3 ds-space-y-2 ds-animate-in">
            <input
              className="ds-input ds-input-sm"
              placeholder="Event type (e.g., custom:action)"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
            />
            <textarea
              className="ds-textarea ds-text-sm"
              rows={2}
              placeholder='JSON payload (e.g., {"key": "value"})'
              value={customData}
              onChange={(e) => setCustomData(e.target.value)}
            />
            <button
              className="ds-btn-primary ds-btn-sm ds-w-full"
              onClick={handleCustomSend}
            >
              Send Custom Event
            </button>
          </div>
        )}

        <div className="ds-text-xs ds-text-muted ds-border-t ds-pt-2">
          <p>📤 Broadcasting to all subscribers</p>
          <p>🔌 Connected to platform event bus</p>
        </div>
      </div>
    </div>
  );
};