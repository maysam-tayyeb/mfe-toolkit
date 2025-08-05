import { MFEServices } from '@mfe-toolkit/core';
import { createMFEServices } from './mfe-services';

let mfeServicesInstance: MFEServices | null = null;

export const getMFEServicesSingleton = (): MFEServices => {
  if (!mfeServicesInstance) {
    mfeServicesInstance = createMFEServices();
  }

  return mfeServicesInstance;
};