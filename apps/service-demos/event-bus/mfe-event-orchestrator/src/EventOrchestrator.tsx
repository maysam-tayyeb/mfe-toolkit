import React, { useState, useEffect, useRef } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type EventOrchestratorProps = {
  services: MFEServices;
};

type OrderStatus = 'pending' | 'processing' | 'fulfilled' | 'cancelled';

type Order = {
  id: string;
  status: OrderStatus;
  items: number;
  timestamp: string;
};

export const EventOrchestrator: React.FC<EventOrchestratorProps> = ({ services }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string | null>(null);
  const processingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const processOrder = (orderId: string) => {
    // Prevent processing the same order multiple times
    if (processingTimeoutsRef.current.has(orderId)) {
      return;
    }
    
    setCurrentProcessing(orderId);
    
    // Simulate order processing workflow
    const timeout1 = setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'processing' } : order
      ));
      
      // Emit events for services
      services.eventBus.emit('inventory:check', { orderId });
      services.eventBus.emit('payment:process', { orderId });
    }, 500);
    
    const timeout2 = setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'fulfilled' } : order
      ));
      setTotalProcessed(prev => prev + 1);
      setCurrentProcessing(null);
      
      // Emit completion events
      services.eventBus.emit('email:sent', { orderId, type: 'confirmation' });
      services.eventBus.emit('analytics:track', { event: 'order_completed', orderId });
      
      // Clear the timeouts from the map
      processingTimeoutsRef.current.delete(orderId);
    }, 2000);
    
    // Store the timeouts to prevent duplicate processing
    processingTimeoutsRef.current.set(orderId, timeout2);
    
    services.logger.info(`[Order Processor] Processing order ${orderId}`);
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
    
    services.eventBus.emit('order:cancelled', { orderId });
    services.eventBus.emit('inventory:restock', { orderId });
    services.eventBus.emit('email:sent', { orderId, type: 'cancellation' });
    
    services.logger.info(`[Order Processor] Cancelled order ${orderId}`);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'ds-badge-warning';
      case 'processing': return 'ds-badge-info';
      case 'fulfilled': return 'ds-badge-success';
      case 'cancelled': return 'ds-badge-danger';
      default: return 'ds-badge';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '⚙️';
      case 'fulfilled': return '✅';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };


  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    // Listen for new orders
    unsubscribes.push(
      services.eventBus.on('order:placed', (payload) => {
        const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
        const newOrder: Order = {
          id: orderId,
          status: 'pending',
          items: payload.data?.items || Math.floor(Math.random() * 5) + 1,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setOrders(prev => [newOrder, ...prev].slice(0, 5)); // Keep last 5 orders
        
        // Auto-process after a short delay
        setTimeout(() => processOrder(orderId), 1000);
      })
    );
    
    unsubscribes.push(
      services.eventBus.on('order:cancelled', (payload) => {
        if (payload.data?.orderId) {
          cancelOrder(payload.data.orderId);
        }
      })
    );

    services.eventBus.emit('mfe:ready', { 
      name: 'order-processor',
      capabilities: ['process', 'track', 'fulfill']
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
      
      // Clear all processing timeouts
      processingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      processingTimeoutsRef.current.clear();
      
      services.eventBus.emit('mfe:unloaded', { 
        name: 'order-processor'
      });
    };
  }, [services]); // Remove orders from dependencies to prevent re-subscriptions

  return (
    <div className="ds-card ds-p-4">
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
        <h4 className="ds-card-title ds-mb-0">📦 Order Processor</h4>
        <span className="ds-badge-primary">✅ Fulfilled: {totalProcessed}</span>
      </div>

      {currentProcessing && (
        <div className="ds-alert-info ds-mb-3 ds-text-xs ds-animate-pulse">
          Processing order: <strong>{currentProcessing}</strong>
        </div>
      )}

      <div className="ds-space-y-3">
        {orders.length === 0 ? (
          <div className="ds-empty-state ds-py-8 ds-text-center">
            <p className="ds-text-muted ds-text-sm">📦 No orders to process</p>
            <p className="ds-text-xs ds-text-muted ds-mt-1">
              Orders will appear here when placed
            </p>
          </div>
        ) : (
          <div className="ds-space-y-2">
            <p className="ds-text-sm ds-text-muted ds-mb-2">Recent Orders:</p>
            {orders.map(order => (
              <div key={order.id} className="ds-border ds-rounded ds-p-2">
                <div className="ds-flex ds-justify-between ds-items-center">
                  <div className="ds-flex ds-items-center ds-gap-2">
                    <span className="ds-text-sm ds-font-medium">{order.id}</span>
                    <span className="ds-text-xs ds-text-muted">({order.items} items)</span>
                  </div>
                  <div className="ds-flex ds-items-center ds-gap-2">
                    <span className={`ds-badge ds-badge-sm ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                    <span className="ds-text-xs ds-text-muted">{order.timestamp}</span>
                  </div>
                </div>
                {order.status === 'pending' && (
                  <div className="ds-mt-2">
                    <button 
                      onClick={() => cancelOrder(order.id)}
                      className="ds-btn-danger ds-btn-sm"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="ds-border-t ds-pt-2">
          <div className="ds-text-xs ds-text-muted">
            <p>🏭 Processing orders automatically</p>
            <p>📧 Sending notifications to services</p>
            <p>📊 Tracking order lifecycle events</p>
          </div>
        </div>
      </div>
    </div>
  );
};