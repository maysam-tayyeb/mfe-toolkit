import React from 'react';
import { useUI } from '@/contexts/UIContext';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { addNotification } = useUI();

  const notificationTypes = [
    {
      type: 'success' as const,
      title: 'Success Notification',
      message: 'This is a success notification example',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      type: 'error' as const,
      title: 'Error Notification',
      message: 'This is an error notification example',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-red-600 dark:text-red-400'
    },
    {
      type: 'warning' as const,
      title: 'Warning Notification',
      message: 'This is a warning notification example',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      type: 'info' as const,
      title: 'Info Notification',
      message: 'This is an info notification example',
      icon: <Info className="h-5 w-5" />,
      color: 'text-blue-600 dark:text-blue-400'
    }
  ];

  const handleTestNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    addNotification({ type, title, message });
  };

  return (
    <div className="ds-page">
      <div className="ds-section">
        <h1 className="ds-page-title">Notification Service</h1>
        <p className="ds-text-muted">Test the platform notification system</p>
      </div>

      <div className="ds-card-padded">
        <h2 className="ds-section-title mb-6">Notification Types</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {notificationTypes.map((notification) => (
            <div key={notification.type} className="ds-card-compact">
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${notification.color}`}>
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{notification.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {notification.message}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestNotification(notification.type, notification.title, notification.message)}
                  >
                    <Bell className="h-3 w-3 mr-1.5" />
                    Test {notification.type}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-card-padded">
        <h2 className="ds-section-title mb-4">Custom Notification</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleTestNotification(
            formData.get('type') as any,
            formData.get('title') as string,
            formData.get('message') as string
          );
        }} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="ds-label">Type</label>
              <select name="type" className="ds-select">
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="ds-label">Title</label>
              <input
                name="title"
                type="text"
                className="ds-input"
                placeholder="Notification title"
                required
              />
            </div>
          </div>
          <div>
            <label className="ds-label">Message</label>
            <textarea
              name="message"
              className="ds-textarea"
              rows={3}
              placeholder="Notification message"
              required
            />
          </div>
          <Button type="submit">
            <Bell className="h-4 w-4 mr-2" />
            Send Custom Notification
          </Button>
        </form>
      </div>
    </div>
  );
};