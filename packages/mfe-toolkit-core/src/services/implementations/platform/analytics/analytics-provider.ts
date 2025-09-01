/**
 * Analytics Service Provider
 */

import type { ServiceProvider, ServiceContainer } from '../../../../registry/types';
import type { AnalyticsService, AnalyticsConfig } from "../../../../services/types";
import { ANALYTICS_SERVICE_KEY } from "../../../../services/types";
import { AnalyticsServiceImpl } from './analytics-service';

export interface AnalyticsProviderOptions extends AnalyticsConfig {
  // Additional provider-specific options can be added here
}

/**
 * Create an analytics service provider
 */
export function createAnalyticsProvider(options?: AnalyticsProviderOptions): ServiceProvider<AnalyticsService> {
  return {
    name: ANALYTICS_SERVICE_KEY,
    version: '1.0.0',
    dependencies: ['logger'],
    
    create(container: ServiceContainer): AnalyticsService {
      const logger = container.get('logger');
      const service = new AnalyticsServiceImpl(options);
      
      if (logger) {
        logger.info('Analytics service initialized');
        
        // Track errors
        if (typeof window !== 'undefined') {
          window.addEventListener('error', (event) => {
            service.track('error', {
              message: event.message,
              source: event.filename,
              line: event.lineno,
              column: event.colno,
            });
          });
        }
      }
      
      return service;
    },
    
    dispose(): void {
      // Cleanup handled by service
    },
  };
}

/**
 * Default analytics service provider
 */
export const analyticsServiceProvider = createAnalyticsProvider();