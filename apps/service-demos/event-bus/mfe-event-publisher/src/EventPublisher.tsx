import React, { useState, useEffect } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type EventPublisherProps = {
  services: MFEServices;
};

const orderActions = [
  { 
    label: 'Place Order', 
    type: 'order:placed', 
    data: { items: 3, total: 299.99, customerId: 'CUST-001' },
    className: 'ds-btn-primary',
    icon: '🛒'
  },
  { 
    label: 'Add to Cart', 
    type: 'cart:item-added', 
    data: { productId: 'PROD-123', quantity: 1, price: 49.99 },
    className: 'ds-btn-secondary',
    icon: '➕'
  },
  { 
    label: 'Apply Coupon', 
    type: 'order:coupon-applied', 
    data: { code: 'SAVE20', discount: 20 },
    className: 'ds-btn-outline',
    icon: '🎟️'
  },
  { 
    label: 'Update Shipping', 
    type: 'order:shipping-updated', 
    data: { method: 'express', cost: 15.99 },
    className: 'ds-btn-outline',
    icon: '📦'
  }
];

export const EventPublisher: React.FC<EventPublisherProps> = ({ services }) => {
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const performAction = (type: string, data: any, label: string) => {
    services.eventBus.emit(type, data);
    setActionCount(prev => prev + 1);
    setLastAction(label);
    const time = new Date().toLocaleTimeString();
    
    services.logger.info(`[Order Actions] ${label}: ${type}`, data);
    
    // Use notification service for feedback
    if (services.notifications) {
      services.notifications.addNotification({
        type: 'success',
        title: label,
        message: `Action performed at ${time}`
      });
    }
  };

  useEffect(() => {
    services.eventBus.emit('mfe:ready', { 
      name: 'order-actions',
      capabilities: ['order-management', 'cart-operations']
    });

    return () => {
      services.eventBus.emit('mfe:unloaded', { 
        name: 'order-actions',
        actionCount 
      });
    };
  }, [services, actionCount]);

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">🛍️ Order Actions</h4>
        <span className="ds-badge-success">Actions: {actionCount}</span>
      </div>

      {lastAction && (
        <div className="ds-alert-success ds-mb-3 ds-text-xs ds-animate-in">
          Last action: <strong>{lastAction}</strong>
        </div>
      )}

      <div className="ds-space-y-3">
        <div className="ds-grid ds-grid-cols-2 ds-gap-2">
          {orderActions.map((action) => (
            <button
              key={action.type}
              className={`${action.className} ds-btn-sm`}
              onClick={() => performAction(action.type, action.data, action.label)}
              title={`Perform ${action.label}`}
            >
              <span>{action.icon} {action.label}</span>
            </button>
          ))}
        </div>

        <div className="ds-text-xs ds-text-muted ds-border-t ds-pt-2">
          <p>🛒 Simulating customer order actions</p>
          <p>📡 Broadcasting to order processing system</p>
        </div>
      </div>
    </div>
  );
};