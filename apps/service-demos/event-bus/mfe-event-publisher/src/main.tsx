import React from 'react';
import ReactDOM from 'react-dom/client';
import { EventPublisher } from './EventPublisher';
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const mount = (element: HTMLElement, services: MFEServices) => {
  const root = ReactDOM.createRoot(element);
  
  root.render(
    <React.StrictMode>
      <EventPublisher services={services} />
    </React.StrictMode>
  );

  return () => {
    root.unmount();
  };
};

const unmount = () => {
  // Cleanup handled by mount return function
};

const eventPublisherModule: MFEModule = { mount, unmount };

export default eventPublisherModule;