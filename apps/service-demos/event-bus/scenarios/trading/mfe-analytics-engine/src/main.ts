import { AnalyticsEngine } from './AnalyticsEngine';
import type { MFEMount, MFEUnmount, MFEServices } from '@mfe-toolkit/core';

let instance: AnalyticsEngine | null = null;

export default {
  mount: ((container: HTMLElement, services: MFEServices) => {
    instance = new AnalyticsEngine(container, services);
    
    return {
      unmount: () => {
        if (instance) {
          instance.destroy();
          instance = null;
        }
      }
    };
  }) as MFEMount,
  
  unmount: (() => {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  }) as MFEUnmount
};