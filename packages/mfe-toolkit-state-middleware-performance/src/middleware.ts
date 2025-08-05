import type { StateChangeEvent } from '@mfe-toolkit/state';
import { measureStateUpdate, getStatePerformanceMonitor } from './state-performance-monitor';

/**
 * Performance monitoring middleware for UniversalStateManager
 * Automatically tracks state update performance metrics
 */
export function createPerformanceMiddleware() {
  return (event: StateChangeEvent, next: () => void) => {
    // Measure the time it takes to process the state change
    measureStateUpdate(() => {
      next();
    }, `State update: ${event.key}`);
    
    // Track additional metrics if monitor is available
    const monitor = getStatePerformanceMonitor();
    if (monitor && event.type === 'set') {
      // Log large object updates
      if (typeof event.value === 'object' && event.value !== null) {
        const size = JSON.stringify(event.value).length;
        if (size > 1000) {
          monitor.logCustomMetric('Large object update', {
            key: event.key,
            size: `${(size / 1024).toFixed(2)}KB`
          });
        }
      }
    }
  };
}

/**
 * Create a performance monitoring middleware with custom thresholds
 */
export function createPerformanceMiddlewareWithThresholds(options: {
  slowUpdateThreshold?: number; // ms
  largeObjectThreshold?: number; // bytes
  logSlowUpdates?: boolean;
  logLargeObjects?: boolean;
} = {}) {
  const {
    slowUpdateThreshold = 16, // Default to one frame (16ms)
    largeObjectThreshold = 1000,
    logSlowUpdates = true,
    logLargeObjects = true
  } = options;

  return (event: StateChangeEvent, next: () => void) => {
    const start = performance.now();
    
    next();
    
    const duration = performance.now() - start;
    const monitor = getStatePerformanceMonitor();
    
    if (monitor) {
      monitor.trackStateUpdate(duration);
      
      // Log slow updates
      if (logSlowUpdates && duration > slowUpdateThreshold) {
        monitor.logCustomMetric('Slow state update detected', {
          key: event.key,
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${slowUpdateThreshold}ms`
        });
      }
      
      // Log large objects
      if (logLargeObjects && event.type === 'set' && 
          typeof event.value === 'object' && event.value !== null) {
        const size = JSON.stringify(event.value).length;
        if (size > largeObjectThreshold) {
          monitor.logCustomMetric('Large object in state', {
            key: event.key,
            size: `${(size / 1024).toFixed(2)}KB`,
            threshold: `${(largeObjectThreshold / 1024).toFixed(2)}KB`
          });
        }
      }
    }
  };
}