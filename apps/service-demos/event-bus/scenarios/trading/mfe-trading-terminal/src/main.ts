import { createApp } from 'vue';
import TradingTerminal from './TradingTerminal.vue';
import type { MFEMount, MFEUnmount, MFEServices } from '@mfe-toolkit/core';

let app: any = null;

export default {
  mount: ((container: HTMLElement, services: MFEServices) => {
    app = createApp(TradingTerminal, { services });
    app.mount(container);
    
    return {
      unmount: () => {
        if (app) {
          app.unmount();
          app = null;
        }
      }
    };
  }) as MFEMount,
  
  unmount: (() => {
    if (app) {
      app.unmount();
      app = null;
    }
  }) as MFEUnmount
};