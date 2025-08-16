import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  color: string;
}

const notificationTypes: NotificationConfig[] = [
  {
    type: 'success',
    title: 'Success Notification',
    message: 'This is a success notification from React 17',
    icon: '✓',
    color: 'ds-text-green-600'
  },
  {
    type: 'error',
    title: 'Error Notification',
    message: 'This is an error notification from React 17',
    icon: '⚠',
    color: 'ds-text-red-600'
  },
  {
    type: 'warning',
    title: 'Warning Notification',
    message: 'This is a warning notification from React 17',
    icon: '⚠',
    color: 'ds-text-amber-600'
  },
  {
    type: 'info',
    title: 'Info Notification',
    message: 'This is an info notification from React 17',
    icon: 'ℹ',
    color: 'ds-text-blue-600'
  }
];

export const App: React.FC<AppProps> = ({ services }) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customType, setCustomType] = useState<NotificationType>('info');

  const handleTestNotification = (config: NotificationConfig) => {
    services.notification?.show({
      type: config.type,
      title: config.title,
      message: config.message
    });
  };

  const handleCustomNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle && customMessage) {
      services.notification?.show({
        type: customType,
        title: customTitle,
        message: customMessage
      });
    }
  };

  return (
    <div className="ds-p-4">
      <div className="ds-mb-6">
        <h2 className="ds-section-title ds-mb-6">Notification Types (React 17)</h2>
        <div className="ds-grid ds-grid-cols-2 ds-gap-4">
          {notificationTypes.map((notification) => (
            <div key={notification.type} className="ds-card-compact">
              <div className="ds-flex ds-items-start ds-gap-3">
                <div className={`ds-mt-1 ${notification.color}`}>
                  <span className="ds-text-lg">{notification.icon}</span>
                </div>
                <div className="ds-flex-1">
                  <h3 className="ds-font-medium ds-mb-1">{notification.title}</h3>
                  <p className="ds-text-sm ds-text-slate-600 ds-dark:text-slate-400 ds-mb-3">
                    {notification.message}
                  </p>
                  <button
                    className="ds-btn-outline ds-btn-sm"
                    onClick={() => handleTestNotification(notification)}
                  >
                    <span className="ds-mr-2">🔔</span>
                    Test {notification.type}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="ds-section-title ds-mb-4">Custom Notification</h2>
        <form onSubmit={handleCustomNotification} className="ds-space-y-4">
          <div className="ds-grid ds-grid-cols-2 ds-gap-4">
            <div>
              <label className="ds-label">Type</label>
              <select 
                value={customType}
                onChange={(e) => setCustomType(e.target.value as NotificationType)}
                className="ds-select"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="ds-label">Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="ds-input"
                placeholder="Notification title"
                required
              />
            </div>
          </div>
          <div>
            <label className="ds-label">Message</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="ds-textarea"
              rows={3}
              placeholder="Notification message"
              required
            />
          </div>
          <button type="submit" className="ds-btn-primary">
            <span className="ds-mr-2">🔔</span>
            Send Custom Notification
          </button>
        </form>
      </div>
    </div>
  );
};