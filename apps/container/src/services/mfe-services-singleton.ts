import { MFEServices } from '@mfe/dev-kit';
import { createMFEServices } from './mfe-services';

let mfeServicesInstance: MFEServices | null = null;

export const getMFEServicesSingleton = (): MFEServices => {
  if (!mfeServicesInstance) {
    mfeServicesInstance = createMFEServices();

    // Store on window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__MFE_SERVICES__ = mfeServicesInstance;
    }
  }

  return mfeServicesInstance;
};
