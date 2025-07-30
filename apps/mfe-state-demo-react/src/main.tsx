import ReactDOM from 'react-dom/client';
import { App } from './App';

// MFE export - this is what gets loaded by the container
const StateDemoReactMFE = {
  mount: (element: HTMLElement, services: any) => {
    console.log('[React State Demo] Mounting with services:', services);

    // Get state manager from services
    const stateManager = services.stateManager;
    if (!stateManager) {
      console.error('[React State Demo] No state manager provided in services');
      // Show error UI
      const root = ReactDOM.createRoot(element);
      root.render(
        <div style={{ padding: '20px', color: 'red' }}>Error: No state manager provided</div>
      );
      return;
    }

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
  },
};

export default StateDemoReactMFE;
