import React from 'react';
import ReactDOM from 'react-dom/client';
import type { MFEServices } from '@mfe-toolkit/core';
import App from './App';

const react19EventBusDemo = {
  mount: (element: HTMLElement, services: MFEServices) => {
    const root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );
    
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

export default react19EventBusDemo;