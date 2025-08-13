import { AutomationRules } from './AutomationRules';
import type { MFEMount, MFEUnmount, MFEServices } from '@mfe-toolkit/core';

let instance: AutomationRules | null = null;

export default {
  mount: ((container: HTMLElement, services: MFEServices) => {
    instance = new AutomationRules(container, services);
    
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