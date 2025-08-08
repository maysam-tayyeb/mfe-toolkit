import { createApp } from 'vue';
import type { MFEServices } from '@mfe-toolkit/core';
import App from './App.vue';

const vue3ModalDemo = {
  mount: (element: HTMLElement, services: MFEServices) => {
    const app = createApp(App, { services });
    app.mount(element);

    (element as any).__vueApp = app;
  },
  unmount: (element: HTMLElement) => {
    const app = (element as any).__vueApp;
    if (app) {
      app.unmount();
      delete (element as any).__vueApp;
    }
  },
};

export default vue3ModalDemo;
