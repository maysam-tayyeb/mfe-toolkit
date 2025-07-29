import { createApp } from 'vue';
import App from './App.vue';
import type { MFEModule } from '@mfe/dev-kit';
import { getGlobalStateManager } from '@mfe/universal-state';
import './style.css';

// For standalone development
if (import.meta.env.DEV && !(window as any).__MFE_SERVICES__) {
  const stateManager = getGlobalStateManager({
    devtools: true,
    persistent: true,
    crossTab: true
  });
  
  createApp(App, { stateManager }).mount('#app');
}

// MFE export
const StateDemoVueMFE: MFEModule = {
  mount: (element: HTMLElement, services: any) => {
    // Get or create state manager
    const stateManager = services.stateManager || getGlobalStateManager({
      devtools: true,
      persistent: true,
      crossTab: true
    });
    
    const app = createApp(App, { stateManager });
    app.mount(element);
    
    // Store reference for unmount
    (element as any)._vueApp = app;
  },
  
  unmount: () => {
    const app = (element as any)._vueApp;
    if (app) {
      app.unmount();
      delete (element as any)._vueApp;
    }
  }
};

export default StateDemoVueMFE;