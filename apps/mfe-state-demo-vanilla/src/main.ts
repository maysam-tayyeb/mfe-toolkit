// Vanilla TypeScript State Demo MFE
import type { MFEServices } from '@mfe/dev-kit';
import { ValtioStateManager } from '@mfe/universal-state';
import valtioMFE from './valtio-main';

// For backward compatibility, check if we're using Valtio
const isValtio = (services: MFEServices): boolean => {
  return services.stateManager instanceof ValtioStateManager;
};

// Export the appropriate implementation based on the state manager type
const StateDemoVanillaMFE = {
  mount: (element: HTMLElement, services: MFEServices) => {
    if (isValtio(services)) {
      return valtioMFE.mount(element, services);
    }
    // For now, fall back to Valtio implementation as we're migrating
    console.log('[Vanilla State Demo] Using Valtio implementation');
    return valtioMFE.mount(element, services);
  },
  unmount: (element: HTMLElement) => {
    return valtioMFE.unmount(element);
  }
};

export default StateDemoVanillaMFE;