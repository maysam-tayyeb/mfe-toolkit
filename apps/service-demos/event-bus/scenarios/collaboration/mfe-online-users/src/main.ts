import { OnlineUsers } from './OnlineUsers';
import type { MFEMount, MFEUnmount, MFEServices } from '@mfe-toolkit/core';

let instance: OnlineUsers | null = null;

export default {
  mount: ((container: HTMLElement, services: MFEServices) => {
    instance = new OnlineUsers(container, services);
    
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