import React, { useState, useEffect, useRef } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type ServiceNotification = {
  id: string;
  service: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon: string;
};

type EventSubscriberProps = {
  services: MFEServices;
};

const MAX_NOTIFICATIONS = 8;

export const EventSubscriber: React.FC<EventSubscriberProps> = ({ services }) => {
  const [notifications, setNotifications] = useState<ServiceNotification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const paymentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscriptions: Array<() => void> = [];

    const addNotification = (service: string, message: string, type: ServiceNotification['type'] = 'info', icon: string = '📬') => {
      const newNotification: ServiceNotification = {
        id: `${Date.now()}-${Math.random()}`,
        service,
        message,
        timestamp: new Date().toLocaleTimeString(),
        type,
        icon
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS));
      setNotificationCount(prev => prev + 1);
      
      services.logger.info(`[Service Notifications] ${service}: ${message}`);
    };

    // Order events
    subscriptions.push(
      services.eventBus.on('order:placed', (payload) => {
        addNotification('Order Service', `New order received with ${payload.data?.items || 0} items`, 'success', '📦');
        addNotification('Inventory', 'Checking stock availability', 'info', '📊');
        addNotification('Payment', `Processing payment of $${payload.data?.total || 0}`, 'info', '💳');
      })
    );

    subscriptions.push(
      services.eventBus.on('order:cancelled', (payload) => {
        addNotification('Order Service', `Order ${payload.data?.orderId} cancelled`, 'warning', '❌');
      })
    );

    // Cart events
    subscriptions.push(
      services.eventBus.on('cart:item-added', (payload) => {
        addNotification('Cart Service', `Added ${payload.data?.productId} to cart`, 'success', '🛒');
        addNotification('Analytics', 'Tracked add-to-cart event', 'info', '📈');
      })
    );

    // Inventory events
    subscriptions.push(
      services.eventBus.on('inventory:check', (payload) => {
        addNotification('Inventory', `Verifying stock for order ${payload.data?.orderId}`, 'info', '📦');
      })
    );

    subscriptions.push(
      services.eventBus.on('inventory:restock', (payload) => {
        addNotification('Inventory', `Restocking items from cancelled order`, 'info', '♻️');
      })
    );

    // Payment events
    subscriptions.push(
      services.eventBus.on('payment:process', (payload) => {
        addNotification('Payment Gateway', `Processing payment for ${payload.data?.orderId}`, 'info', '💰');
        
        // Clear any existing payment confirmation timeout
        if (paymentTimeoutRef.current) {
          clearTimeout(paymentTimeoutRef.current);
        }
        
        // Set a new timeout for payment confirmation
        paymentTimeoutRef.current = setTimeout(() => {
          addNotification('Payment Gateway', `Payment confirmed for ${payload.data?.orderId}`, 'success', '✅');
          paymentTimeoutRef.current = null;
        }, 1500);
      })
    );

    // Email events
    subscriptions.push(
      services.eventBus.on('email:sent', (payload) => {
        const emailType = payload.data?.type || 'notification';
        const messages: Record<string, string> = {
          confirmation: 'Order confirmation email sent',
          cancellation: 'Cancellation email sent',
          notification: 'Email notification sent'
        };
        addNotification('Email Service', messages[emailType] || 'Email sent', 'success', '📧');
      })
    );

    // Analytics events
    subscriptions.push(
      services.eventBus.on('analytics:track', (payload) => {
        addNotification('Analytics', `Event "${payload.data?.event}" tracked`, 'info', '📊');
      })
    );

    // Coupon events
    subscriptions.push(
      services.eventBus.on('order:coupon-applied', (payload) => {
        addNotification('Promotions', `Coupon ${payload.data?.code} applied (${payload.data?.discount}% off)`, 'success', '🎟️');
        addNotification('Pricing', 'Recalculating order total', 'info', '🧮');
      })
    );

    // Shipping events
    subscriptions.push(
      services.eventBus.on('order:shipping-updated', (payload) => {
        addNotification('Shipping', `Updated to ${payload.data?.method} shipping ($${payload.data?.cost})`, 'info', '🚚');
      })
    );

    services.eventBus.emit('mfe:ready', { 
      name: 'service-notifications',
      capabilities: ['monitor', 'display']
    });

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      
      // Clear payment timeout if it exists
      if (paymentTimeoutRef.current) {
        clearTimeout(paymentTimeoutRef.current);
      }
      
      services.eventBus.emit('mfe:unloaded', { 
        name: 'service-notifications'
      });
    };
  }, [services]);

  const getNotificationColor = (type: ServiceNotification['type']) => {
    switch (type) {
      case 'success': return 'ds-alert-success';
      case 'warning': return 'ds-alert-warning';
      case 'error': return 'ds-alert-danger';
      default: return 'ds-alert-info';
    }
  };

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">🔔 Service Notifications</h4>
        <span className="ds-badge-info">Total: {notificationCount}</span>
      </div>

      <div className="ds-space-y-2 ds-max-h-64 ds-overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="ds-empty-state ds-py-8 ds-text-center">
            <p className="ds-text-muted ds-text-sm">📡 Monitoring services...</p>
            <p className="ds-text-xs ds-text-muted ds-mt-1">
              Service notifications will appear here
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`${getNotificationColor(notification.type)} ds-p-2 ds-rounded ds-text-sm`}
            >
              <div className="ds-flex ds-justify-between ds-items-start">
                <div className="ds-flex ds-items-start ds-gap-2">
                  <span>{notification.icon}</span>
                  <div>
                    <div className="ds-font-medium ds-text-xs">{notification.service}</div>
                    <div className="ds-text-xs">{notification.message}</div>
                  </div>
                </div>
                <span className="ds-text-xs ds-text-muted">{notification.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="ds-border-t ds-pt-2 ds-mt-3">
        <div className="ds-text-xs ds-text-muted ds-space-y-1">
          <p>📡 Monitoring: Order, Payment, Inventory, Email, Analytics</p>
        </div>
      </div>
    </div>
  );
};