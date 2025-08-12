import React, { useState, useEffect } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type ActivityFeedProps = {
  services: MFEServices;
};

type Activity = {
  id: string;
  type: string;
  user: string;
  message: string;
  timestamp: string;
  icon: string;
};

const MAX_ACTIVITIES = 10;

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ services }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    const addActivity = (type: string, user: string, message: string, icon: string) => {
      const newActivity: Activity = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        user,
        message,
        timestamp: new Date().toLocaleTimeString(),
        icon
      };

      setActivities(prev => [newActivity, ...prev].slice(0, MAX_ACTIVITIES));
    };

    // User events
    subscriptions.push(
      services.eventBus.on('user:joined', (payload) => {
        addActivity('joined', payload.data?.user || 'Someone', 'joined the workspace', '👋');
      })
    );

    subscriptions.push(
      services.eventBus.on('user:left', (payload) => {
        addActivity('left', payload.data?.user || 'Someone', 'left the workspace', '👋');
      })
    );

    subscriptions.push(
      services.eventBus.on('user:typing', (payload) => {
        const user = payload.data?.user || 'Someone';
        setTypingUsers(prev => new Set([...prev, user]));
      })
    );

    subscriptions.push(
      services.eventBus.on('user:stopped-typing', (payload) => {
        const user = payload.data?.user || 'Someone';
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(user);
          return newSet;
        });
      })
    );

    // Document events
    subscriptions.push(
      services.eventBus.on('document:created', (payload) => {
        addActivity(
          'document', 
          payload.data?.author || 'Someone',
          `created "${payload.data?.title || 'a document'}"`,
          '📄'
        );
      })
    );

    subscriptions.push(
      services.eventBus.on('document:saved', (payload) => {
        addActivity(
          'document',
          'Someone',
          `saved "${payload.data?.title || 'a document'}" (${payload.data?.wordCount || 0} words)`,
          '💾'
        );
      })
    );

    subscriptions.push(
      services.eventBus.on('document:shared', (payload) => {
        addActivity(
          'document',
          payload.data?.sharedBy || 'Someone',
          `shared "${payload.data?.title || 'a document'}"`,
          '🔗'
        );
      })
    );

    subscriptions.push(
      services.eventBus.on('document:title-changed', (payload) => {
        addActivity(
          'document',
          'Someone',
          `renamed document to "${payload.data?.title || 'Untitled'}"`,
          '✏️'
        );
      })
    );

    // Initial activity
    addActivity('system', 'System', 'Activity feed started', '🚀');

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [services]);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'joined': return 'ds-alert-success';
      case 'left': return 'ds-alert-warning';
      case 'document': return 'ds-alert-info';
      default: return 'ds-alert';
    }
  };

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">🎯 Activity Feed</h4>
        <span className="ds-badge-info">{activities.length} activities</span>
      </div>

      {typingUsers.size > 0 && (
        <div className="ds-alert-warning ds-mb-3 ds-animate-pulse">
          <div className="ds-text-sm">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        </div>
      )}

      <div className="ds-space-y-2 ds-max-h-64 ds-overflow-y-auto">
        {activities.length === 0 ? (
          <div className="ds-empty-state ds-py-8 ds-text-center">
            <p className="ds-text-muted ds-text-sm">No activity yet</p>
            <p className="ds-text-xs ds-text-muted ds-mt-1">
              Activities will appear here
            </p>
          </div>
        ) : (
          activities.map(activity => (
            <div
              key={activity.id}
              className={`${getActivityColor(activity.type)} ds-p-2 ds-rounded ds-text-sm`}
            >
              <div className="ds-flex ds-justify-between ds-items-start">
                <div className="ds-flex ds-items-start ds-gap-2">
                  <span>{activity.icon}</span>
                  <div>
                    <span className="ds-font-medium">{activity.user}</span>{' '}
                    <span className="ds-text-xs">{activity.message}</span>
                  </div>
                </div>
                <span className="ds-text-xs ds-text-muted">{activity.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="ds-border-t ds-pt-2 ds-mt-3">
        <div className="ds-text-xs ds-text-muted">
          <p>📡 Monitoring workspace activity</p>
        </div>
      </div>
    </div>
  );
};