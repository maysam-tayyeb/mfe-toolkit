/**
 * Performance monitoring for state manager implementations
 * Tracks key metrics to validate and compare different state management solutions
 */

export interface StatePerformanceMetrics {
  implementation: string;
  sessionDuration: number;
  stateUpdates: number;
  averageUpdateTime: number;
  memoryUsage?: number;
  renderCount: number;
  errors: Array<{ message: string; timestamp: number }>;
}

export class StatePerformanceMonitor {
  private metrics: StatePerformanceMetrics;
  private updateTimes: number[] = [];
  private sessionStart: number;
  private renderObserver?: PerformanceObserver;

  constructor(implementation: string) {
    this.sessionStart = Date.now();
    this.metrics = {
      implementation,
      sessionDuration: 0,
      stateUpdates: 0,
      averageUpdateTime: 0,
      renderCount: 0,
      errors: [],
    };

    this.setupPerformanceObserver();
    this.setupErrorTracking();
    this.setupUnloadHandler();
  }

  private setupPerformanceObserver() {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        // Track React render performance
        this.renderObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure' && entry.name.includes('⚛')) {
              this.metrics.renderCount++;
            }
          }
        });
        this.renderObserver.observe({ entryTypes: ['measure'] });
      } catch (e) {
        console.warn('Performance observer not supported');
      }
    }
  }

  private setupErrorTracking() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (event.message.toLowerCase().includes('state')) {
          this.metrics.errors.push({
            message: event.message,
            timestamp: Date.now(),
          });
        }
      });
    }
  }

  private setupUnloadHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.sendMetrics();
      });
    }
  }

  trackStateUpdate(duration: number) {
    this.metrics.stateUpdates++;
    this.updateTimes.push(duration);
    
    // Keep only last 100 update times
    if (this.updateTimes.length > 100) {
      this.updateTimes.shift();
    }
    
    // Calculate average
    this.metrics.averageUpdateTime = 
      this.updateTimes.reduce((a, b) => a + b, 0) / this.updateTimes.length;
  }

  trackMemoryUsage() {
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  }

  private sendMetrics() {
    this.metrics.sessionDuration = Date.now() - this.sessionStart;
    this.trackMemoryUsage();

    // Log to console for now
    console.log('[StatePerformanceMonitor] Session metrics:', {
      ...this.metrics,
      sessionDurationMinutes: (this.metrics.sessionDuration / 60000).toFixed(2),
      averageUpdateTimeMs: this.metrics.averageUpdateTime.toFixed(2),
      memoryUsageMB: this.metrics.memoryUsage ? 
        (this.metrics.memoryUsage / 1048576).toFixed(2) : 'N/A',
    });

    // In production, send to analytics service
    // analytics.track('state-manager-performance', this.metrics);

    // Store in localStorage for debugging (if available)
    if (typeof localStorage !== 'undefined') {
      try {
        const key = `state-perf-${this.metrics.implementation}-${Date.now()}`;
        localStorage.setItem(key, JSON.stringify(this.metrics));
        
        // Keep only last 5 sessions
        const perfKeys = Object.keys(localStorage)
          .filter(k => k.startsWith('state-perf-'))
          .sort();
        
        if (perfKeys.length > 5) {
          perfKeys.slice(0, -5).forEach(k => localStorage.removeItem(k));
        }
      } catch (e) {
        // Ignore storage errors
      }
    }
  }

  // Public API for manual tracking
  logCustomMetric(name: string, value: any) {
    console.log(`[StatePerformanceMonitor] ${name}:`, value);
  }
}

// Singleton instance
let monitor: StatePerformanceMonitor | null = null;

export function initStatePerformanceMonitor(implementation: string): StatePerformanceMonitor {
  if (!monitor) {
    monitor = new StatePerformanceMonitor(implementation);
  }
  return monitor;
}

export function getStatePerformanceMonitor(): StatePerformanceMonitor | null {
  return monitor;
}

// Helper to measure state update performance
export function measureStateUpdate<T>(
  operation: () => T,
  operationName?: string
): T {
  const start = performance.now();
  const result = operation();
  const duration = performance.now() - start;
  
  if (monitor) {
    monitor.trackStateUpdate(duration);
    if (operationName) {
      monitor.logCustomMetric(`Operation: ${operationName}`, `${duration.toFixed(2)}ms`);
    }
  }
  
  return result;
}

// Helper to get performance summary
export function getPerformanceSummary(): Record<string, any> {
  if (typeof localStorage === 'undefined') {
    return {};
  }

  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith('state-perf-'))
    .sort()
    .reverse()
    .slice(0, 10);
  
  const sessions = keys.map(key => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  // Group by implementation
  const byImplementation = sessions.reduce((acc, session) => {
    const impl = session.implementation;
    if (!acc[impl]) {
      acc[impl] = {
        sessions: 0,
        totalUpdates: 0,
        avgUpdateTime: 0,
        totalErrors: 0,
      };
    }
    
    acc[impl].sessions++;
    acc[impl].totalUpdates += session.stateUpdates || 0;
    acc[impl].avgUpdateTime += session.averageUpdateTime || 0;
    acc[impl].totalErrors += (session.errors || []).length;
    
    return acc;
  }, {} as Record<string, any>);
  
  // Calculate averages
  Object.keys(byImplementation).forEach(impl => {
    const data = byImplementation[impl];
    data.avgUpdateTime = data.avgUpdateTime / data.sessions;
  });
  
  return byImplementation;
}