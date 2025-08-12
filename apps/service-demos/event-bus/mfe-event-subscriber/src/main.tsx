import React from 'react';
import ReactDOM from 'react-dom/client';
import { EventSubscriber } from './EventSubscriber';
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const mount = (element: HTMLElement, services: MFEServices) => {
  const root = ReactDOM.createRoot(element);
  
  root.render(
    <React.StrictMode>
      <EventSubscriber services={services} />
    </React.StrictMode>
  );

  return () => {
    root.unmount();
  };
};

const unmount = () => {
  // Cleanup handled by mount return function
};

const eventSubscriberModule: MFEModule = { mount, unmount };

export default eventSubscriberModule;