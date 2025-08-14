import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import { TabGroup } from '@mfe/design-system-react';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';

// MFE Card Component with Framework Badge (matching EventBusPageV3 style)
const MFECard: React.FC<{
  id: string;
  title: string;
  framework: 'react' | 'vue' | 'vanilla' | 'solid';
  frameworkVersion?: string;
  className?: string;
}> = ({ id, title, framework, frameworkVersion, className = '' }) => {
  const getFrameworkBadge = (framework: 'react' | 'vue' | 'vanilla' | 'solid') => {
    const badges = {
      react: { color: 'ds-bg-blue-500', icon: '⚛️', name: `React${frameworkVersion ? ` ${frameworkVersion}` : ''} MFE` },
      vue: { color: 'ds-bg-green-500', icon: '💚', name: 'Vue 3 MFE' },
      vanilla: { color: 'ds-bg-yellow-600', icon: '📦', name: 'Vanilla TS MFE' },
      solid: { color: 'ds-bg-purple-500', icon: '🔷', name: 'Solid.js MFE' }
    };
    return badges[framework];
  };

  const badge = getFrameworkBadge(framework);

  return (
    <div className={`ds-card ds-p-0 ${className}`}>
      <div className="ds-px-3 ds-py-2 ds-border-b ds-bg-slate-50 ds-flex ds-items-center ds-justify-between">
        <div className="ds-flex ds-items-center ds-gap-2">
          <span className="ds-text-sm ds-font-medium">{title}</span>
        </div>
        <div className={`ds-badge ds-badge-sm ${badge.color} ds-text-white`}>
          {badge.icon} {badge.name}
        </div>
      </div>
      <div>
        <RegistryMFELoader id={id} />
      </div>
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  const { addNotification } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab state - get initial tab from URL or default to 'container'
  const initialTab = searchParams.get('tab') || 'container';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  
  // Sync tab state with URL
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const notificationTypes = [
    {
      type: 'success' as const,
      title: 'Success Notification',
      message: 'This is a success notification example',
      icon: '✓',
      color: 'ds-text-green-600'
    },
    {
      type: 'error' as const,
      title: 'Error Notification',
      message: 'This is an error notification example',
      icon: '⚠',
      color: 'ds-text-red-600'
    },
    {
      type: 'warning' as const,
      title: 'Warning Notification',
      message: 'This is a warning notification example',
      icon: '⚠',
      color: 'ds-text-amber-600'
    },
    {
      type: 'info' as const,
      title: 'Info Notification',
      message: 'This is an info notification example',
      icon: 'ℹ',
      color: 'ds-text-blue-600'
    }
  ];

  const handleTestNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    addNotification({ type, title, message });
  };

  // Container notification content component
  const ContainerNotificationDemo = () => (
    <div className="ds-p-4">
      <div className="ds-mb-6">
        <h2 className="ds-section-title ds-mb-6">Notification Types</h2>
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

      <div>
        <h2 className="ds-section-title ds-mb-4">Custom Notification</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleTestNotification(
            formData.get('type') as any,
            formData.get('title') as string,
            formData.get('message') as string
          );
        }} className="ds-space-y-4">
          <div className="ds-grid ds-grid-cols-2 ds-gap-4">
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
          <button type="submit" className="ds-btn-primary">
            <span className="ds-mr-2">🔔</span>
            Send Custom Notification
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="ds-page">
      <div className="ds-section">
        <h1 className="ds-page-title">Notification Service</h1>
        <p className="ds-text-muted">Test the platform notification system across different frameworks</p>
      </div>

      <TabGroup
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={[
          {
            id: 'container',
            label: '🏠 Container',
            content: (
              <div className="ds-card ds-p-0">
                <div className="ds-px-3 ds-py-2 ds-border-b ds-bg-slate-50 ds-flex ds-items-center ds-justify-between">
                  <div className="ds-flex ds-items-center ds-gap-2">
                    <span className="ds-text-sm ds-font-medium">Notification Service Demo</span>
                  </div>
                  <div className="ds-badge ds-badge-sm ds-bg-slate-600 ds-text-white">
                    🏠 Container Implementation
                  </div>
                </div>
                <div>
                  <ContainerNotificationDemo />
                </div>
              </div>
            )
          },
          {
            id: 'react19',
            label: '⚛️ React 19',
            content: (
              <MFECard 
                id="mfe-notification-react19" 
                title="Notification Service Demo" 
                framework="react"
                frameworkVersion="19"
              />
            )
          },
          {
            id: 'react18',
            label: '⚛️ React 18',
            content: (
              <MFECard 
                id="mfe-notification-react18" 
                title="Notification Service Demo" 
                framework="react"
                frameworkVersion="18"
              />
            )
          },
          {
            id: 'react17',
            label: '⚛️ React 17',
            content: (
              <MFECard 
                id="mfe-notification-react17" 
                title="Notification Service Demo" 
                framework="react"
                frameworkVersion="17"
              />
            )
          },
          {
            id: 'vue3',
            label: '💚 Vue 3',
            content: (
              <MFECard 
                id="mfe-notification-vue3" 
                title="Notification Service Demo" 
                framework="vue"
              />
            )
          },
          {
            id: 'solidjs',
            label: '🔷 Solid.js',
            content: (
              <MFECard 
                id="mfe-notification-solidjs" 
                title="Notification Service Demo" 
                framework="solid"
              />
            )
          },
          {
            id: 'vanilla',
            label: '📦 Vanilla TS',
            content: (
              <MFECard 
                id="mfe-notification-vanilla" 
                title="Notification Service Demo" 
                framework="vanilla"
              />
            )
          }
        ]}
        defaultTab="container"
        className="ds-mt-4"
      />
    </div>
  );
};