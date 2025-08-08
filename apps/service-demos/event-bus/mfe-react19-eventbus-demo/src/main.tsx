import React from 'react';
import { createRoot } from 'react-dom/client';
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';
import App from './App';

let rootElement: HTMLElement | null = null;

const react19EventBusDemo: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    rootElement = element;
    const root = createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );

    (element as any).__reactRoot = root;
  },
  unmount: () => {
    if (rootElement) {
      const root = (rootElement as any).__reactRoot;
      if (root) {
        root.unmount();
        delete (rootElement as any).__reactRoot;
      }
      rootElement = null;
    }
  },
};

export default react19EventBusDemo;
