import type { MFEServices } from '@mfe-toolkit/core';
import { createApp, destroyApp } from './app';

const vanillaModalDemo = {
  mount: (element: HTMLElement, services: MFEServices) => {
    createApp(element, services);
  },
  unmount: (element: HTMLElement) => {
    destroyApp(element);
  },
};

export default vanillaModalDemo;
