import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

type NotificationConfig = {
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  color: string;
};

export const NotificationDemo: React.FC<{ services: MFEServices }> = ({ services }) => {
  const [customType, setCustomType] = useState<NotificationType>('info');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const notificationTypes: NotificationConfig[] = [
    {
      type: 'success',
      title: 'Success Notification',
      message: 'This is a success notification example from React 17',
      icon: '✓',
      color: 'ds-text-green-600'
    },
    {
      type: 'error',
      title: 'Error Notification',
      message: 'This is an error notification example from React 17',
      icon: '⚠',
      color: 'ds-text-red-600'
    },
    {
      type: 'warning',
      title: 'Warning Notification',
      message: 'This is a warning notification example from React 17',
      icon: '⚠',
      color: 'ds-text-amber-600'
    },
    {
      type: 'info',
      title: 'Info Notification',
      message: 'This is an info notification example from React 17',
      icon: 'ℹ',
      color: 'ds-text-blue-600'
    }
  ];

  const handleTestNotification = (type: NotificationType, title: string, message: string) => {
    if (services.notification) {
      services.notification.show({ type, title, message });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle && customMessage) {
      handleTestNotification(customType, customTitle, customMessage);
      // Reset form
      setCustomTitle('');
      setCustomMessage('');
    }
  };

  return (
    <div className="ds-p-4">
      {/* Header with React version badge */}
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-6">
        <h2 className="ds-section-title">React 17 Notifications</h2>
        <span className="ds-badge ds-badge-warning">React {React.version}</span>
      </div>

      {/* Notification Types */}
      <div className="ds-mb-6">
        <h3 className="ds-text-lg ds-font-semibold ds-mb-4">Notification Types</h3>
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
                    onClick={() => handleTestNotification(notification.type, notification.title, notification.message)}
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

      {/* Custom Notification */}
      <div>
        <h3 className="ds-text-lg ds-font-semibold ds-mb-4">Custom Notification</h3>
        <form onSubmit={handleCustomSubmit} className="ds-space-y-4">
          <div className="ds-grid ds-grid-cols-2 ds-gap-4">
            <div>
              <label className="ds-label">Type</label>
              <select 
                className="ds-select"
                value={customType}
                onChange={(e) => setCustomType(e.target.value as NotificationType)}
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
                className="ds-input"
                placeholder="Notification title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="ds-label">Message</label>
            <textarea
              className="ds-textarea"
              rows={3}
              placeholder="Notification message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="ds-btn-primary">
            <span className="ds-mr-2">🔔</span>
            Send Custom Notification
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="ds-mt-6 ds-p-4 ds-bg-surface ds-rounded-lg ds-border">
        <p className="ds-text-sm ds-text-muted">
          This MFE demonstrates the notification service working with React 17. 
          Although labeled as React 17, it uses the shared React instance from the container's import map (React {React.version}). 
          This demonstrates backward compatibility - React 17 code running on React 19 runtime.
        </p>
      </div>
    </div>
  );
};