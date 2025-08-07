import React from 'react';
import ReactDOM from 'react-dom/client';
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';
import App from './AppWithDesignSystem.tsx';

const react19ModalDemo: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    const root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );

    // Store root for cleanup
    (element as any).__reactRoot = root;
  },
  unmount: (element: HTMLElement) => {
    const root = (element as any).__reactRoot;
    if (root) {
      root.unmount();
      delete (element as any).__reactRoot;
    }
  },
};

export default react19ModalDemo;