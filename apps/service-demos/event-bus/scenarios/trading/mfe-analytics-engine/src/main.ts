import { AnalyticsEngine } from './AnalyticsEngine';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

let instance: AnalyticsEngine | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-analytics-engine',
    version: '1.0.0',
    requiredServices: ['eventBus', 'logger'],
    capabilities: ['analytics', 'data-processing', 'volume-tracking']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    instance = new AnalyticsEngine(element, services);
    
    if (services.logger) {
      services.logger.info('[mfe-analytics-engine] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (instance) {
      instance.destroy();
      instance = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-analytics-engine] Unmounted successfully');
    }
  }
};

export default module;