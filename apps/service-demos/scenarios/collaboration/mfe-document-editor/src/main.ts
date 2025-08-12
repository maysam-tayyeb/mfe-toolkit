import { createApp } from 'vue';
import DocumentEditor from './DocumentEditor.vue';
import type { MFEMount, MFEUnmount, MFEServices } from '@mfe-toolkit/core';

export default {
  mount: ((container: HTMLElement, services: MFEServices) => {
    const app = createApp(DocumentEditor, { services });
    app.mount(container);
    
    return {
      unmount: () => {
        app.unmount();
      }
    };
  }) as MFEMount,
  
  unmount: (() => {
    // Cleanup if needed
  }) as MFEUnmount
};