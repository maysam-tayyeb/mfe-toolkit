import { AnalyticsEngine } from './AnalyticsEngine';
import type { MFEModule, MFEServiceContainer, MFEServices } from '@mfe-toolkit/core';

let instance: AnalyticsEngine | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-analytics-engine',
    version: '1.0.0',
    requiredServices: ['eventBus'],
    capabilities: ['real-time-analytics', 'portfolio-analysis', 'trend-detection', 'performance-metrics']
  },

  mount: async (element: HTMLElement, containerOrServices: MFEServiceContainer | MFEServices) => {
    // Handle both V1 (services) and V2 (container) interfaces
    const services = 'getAllServices' in containerOrServices 
      ? containerOrServices.getAllServices() 
      : containerOrServices as MFEServices;
    
    instance = new AnalyticsEngine(element, services);
  },
  
  unmount: async (_container: MFEServiceContainer) => {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }
};

export default module;