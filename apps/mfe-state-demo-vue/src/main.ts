import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// MFE export - this is what gets loaded by the container
const StateDemoVueMFE = {
  mount: (element: HTMLElement, services: any) => {
    console.log('[Vue State Demo] Mounting with services:', services);
    
    // Get state manager from services
    const stateManager = services.stateManager;
    if (!stateManager) {
      console.error('[Vue State Demo] No state manager provided in services');
      // Show error UI
      element.innerHTML = '<div style="padding: 20px; color: red;">Error: No state manager provided</div>';
      return;
    }
    
    const app = createApp(App, { stateManager });
    app.mount(element);
    
    // Store reference for unmount
    (element as any)._vueApp = app;
  },
  
  unmount: (element: HTMLElement) => {
    const app = (element as any)._vueApp;
    if (app) {
      app.unmount();
      delete (element as any)._vueApp;
    }
  }
};

export default StateDemoVueMFE;