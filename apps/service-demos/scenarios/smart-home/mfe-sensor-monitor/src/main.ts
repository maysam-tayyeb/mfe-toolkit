import { createApp } from 'vue';
import SensorMonitor from './SensorMonitor.vue';
import type { MFEMount, MFEUnmount, MFEServices } from '@mfe-toolkit/core';

let app: ReturnType<typeof createApp> | null = null;

const mount: MFEMount = (container: HTMLElement, services: MFEServices) => {
  app = createApp(SensorMonitor, { services });
  app.mount(container);
  
  return {
    unmount: () => {
      if (app) {
        app.unmount();
        app = null;
      }
    }
  };
};

const unmount: MFEUnmount = () => {
  if (app) {
    app.unmount();
    app = null;
  }
};

export default { mount, unmount };