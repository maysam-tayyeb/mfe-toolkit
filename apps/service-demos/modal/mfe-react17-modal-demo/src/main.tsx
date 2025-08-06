import React from 'react';
import ReactDOM from 'react-dom';
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';
import App from './App';

let mountedElement: HTMLElement | null = null;

const react17ModalDemo: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    mountedElement = element;
    ReactDOM.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>,
      element
    );
  },
  unmount: () => {
    if (mountedElement) {
      ReactDOM.unmountComponentAtNode(mountedElement);
      mountedElement = null;
    }
  },
};

export default react17ModalDemo;