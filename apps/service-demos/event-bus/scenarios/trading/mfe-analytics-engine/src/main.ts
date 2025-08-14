import { AnalyticsEngine } from './AnalyticsEngine';
import type { MFEModuleV2, MFEServiceContainer } from '@mfe-toolkit/core';

let instance: AnalyticsEngine | null = null;

const module: MFEModuleV2 = {
  metadata: {
    name: 'mfe-analytics-engine',
    version: '1.0.0',
    requiredServices: ['eventBus'],
    capabilities: ['real-time-analytics', 'portfolio-analysis', 'trend-detection', 'performance-metrics']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
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