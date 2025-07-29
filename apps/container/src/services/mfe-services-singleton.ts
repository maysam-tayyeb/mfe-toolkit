import { MFEServices } from '@mfe/dev-kit';
import { createMFEServices } from './mfe-services';

let mfeServicesInstance: MFEServices | null = null;

export const getMFEServicesSingleton = (): MFEServices => {
  if (!mfeServicesInstance) {
    mfeServicesInstance = createMFEServices();
  }

  return mfeServicesInstance;
};
