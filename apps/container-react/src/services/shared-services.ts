import { ServiceContainer } from '@mfe-toolkit/core';
import { createMFEServices } from './mfe-services';

let mfeServicesInstance: ServiceContainer | null = null;

export const getSharedServices = (): ServiceContainer => {
  if (!mfeServicesInstance) {
    mfeServicesInstance = createMFEServices();
  }

  return mfeServicesInstance;
};
