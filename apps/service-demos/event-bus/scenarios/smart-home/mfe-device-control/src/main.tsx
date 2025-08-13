import React from 'react';
import ReactDOM from 'react-dom/client';
import { DeviceControl } from './DeviceControl';
import type { MFEMount, MFEUnmount, MFEServices } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

export default {
  mount: ((container: HTMLElement, services: MFEServices) => {
    root = ReactDOM.createRoot(container);
    root.render(<DeviceControl services={services} />);
    
    return {
      unmount: () => {
        if (root) {
          root.unmount();
          root = null;
        }
      }
    };
  }) as MFEMount,
  
  unmount: (() => {
    if (root) {
      root.unmount();
      root = null;
    }
  }) as MFEUnmount
};