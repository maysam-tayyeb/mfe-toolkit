import { AnalyticsEngine } from './AnalyticsEngine';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

let instance: AnalyticsEngine | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-analytics-engine',
    version: '1.0.0',
    requiredServices: ['eventBus', 'logger'],
    capabilities: ['analytics', 'data-processing', 'volume-tracking']
  },

  mount: async (element: HTMLElement, container: ServiceContainer) => {
    const eventBus = container.require('eventBus');
    const logger = container.require('logger');
    
    instance = new AnalyticsEngine(element, eventBus, logger);
    
    logger.info('[mfe-analytics-engine] Mounted successfully');
  },
  
  unmount: async (container: ServiceContainer) => {
    if (instance) {
      instance.destroy();
      instance = null;
    }
    
    const logger = container.get('logger');
    logger?.info('[mfe-analytics-engine] Unmounted successfully');
  }
};

export default module;