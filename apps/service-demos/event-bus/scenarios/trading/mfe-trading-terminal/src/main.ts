import { createApp } from 'vue';
import TradingTerminal from './TradingTerminal.vue';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

let app: any = null;

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    app = createApp(TradingTerminal, {
      serviceContainer: container,
    });
    app.mount(element);

    container.require('logger').info('[mfe-trading-terminal] Mounted successfully with Vue 3');
  },

  unmount: async (container: ServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }

    container.require('logger').info('[mfe-trading-terminal] Unmounted successfully');
  },
};

export default module;
