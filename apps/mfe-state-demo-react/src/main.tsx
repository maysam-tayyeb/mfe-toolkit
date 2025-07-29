import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MFEModule } from '@mfe/dev-kit';
import { getGlobalStateManager } from '@mfe/universal-state';

// For standalone development
if (import.meta.env.DEV && !window.__MFE_SERVICES__) {
  const root = document.getElementById('root');
  if (root) {
    const stateManager = getGlobalStateManager({
      devtools: true,
      persistent: true,
      crossTab: true
    });
    
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App stateManager={stateManager} />
      </React.StrictMode>
    );
  }
}

// MFE export
const StateDemoReactMFE: MFEModule = {
  mount: (element: HTMLElement, services: any) => {
    // Get or create state manager
    const stateManager = services.stateManager || getGlobalStateManager({
      devtools: true,
      persistent: true,
      crossTab: true
    });
    
    const root = ReactDOM.createRoot(element);
    root.render(<App stateManager={stateManager} />);
    
    // Store reference for unmount
    (element as any)._reactRoot = root;
  },
  
  unmount: (element: HTMLElement) => {
    const root = (element as any)._reactRoot;
    if (root) {
      root.unmount();
      delete (element as any)._reactRoot;
    }
  }
};

export default StateDemoReactMFE;