import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-vanilla-ts',
    version: '1.0.0',
    requiredServices: ["modal","logger"],
    capabilities: ["modal-demo","modal-testing"]
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    let modalCount = 0;

    element.innerHTML = `
      <div class="ds-card ds-p-6 ds-m-4">
        <div class="ds-mb-6 ds-text-center">
          <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
            📦 Vanilla TS Modal Demo
          </h1>
          <p class="ds-text-gray-600">Pure TypeScript Modal Service</p>
        </div>
        
        <div class="ds-text-center ds-mb-6">
          <div id="modal-count" class="ds-text-3xl ds-font-bold">0</div>
          <div class="ds-text-sm ds-text-gray-600">Modals Opened</div>
        </div>

        <div class="ds-flex ds-flex-wrap ds-gap-2 ds-justify-center">
          <button id="simple-modal" class="ds-btn-primary">Simple Modal</button>
          <button id="confirm-modal" class="ds-btn-success">Confirm Dialog</button>
          <button id="custom-modal" class="ds-btn-secondary">Custom Modal</button>
        </div>
      </div>
    `;

    const updateCount = () => {
      const countEl = element.querySelector('#modal-count');
      if (countEl) countEl.textContent = String(modalCount);
    };

    element.querySelector('#simple-modal')?.addEventListener('click', () => {
      services.modal?.show({
        title: 'Vanilla TypeScript Modal',
        content: 'Pure TypeScript with no framework overhead!',
        showCloseButton: true
      });
      modalCount++;
      updateCount();
    });

    element.querySelector('#confirm-modal')?.addEventListener('click', () => {
      services.modal?.show({
        title: 'Confirm Action',
        content: 'Are you sure? (From Vanilla TS)',
        onConfirm: () => {
          services.modal?.close();
          services.notification?.show({
            title: 'Confirmed',
            message: 'Action confirmed!',
            type: 'success'
          });
        },
        showCloseButton: true
      });
      modalCount++;
      updateCount();
    });

    element.querySelector('#custom-modal')?.addEventListener('click', () => {
      services.modal?.show({
        title: 'Custom Content',
        content: `
          <div class="ds-space-y-2">
            <p>This is custom HTML content</p>
            <div class="ds-bg-accent-primary-soft ds-p-2 ds-rounded">
              <p class="ds-text-sm">Modal count: ${modalCount + 1}</p>
            </div>
          </div>
        `,
        size: 'lg',
        showCloseButton: true
      });
      modalCount++;
      updateCount();
    });
    
    if (services.logger) {
      services.logger.info('[mfe-modal-vanilla-ts] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-modal-vanilla-ts] Unmounted successfully');
    }
  }
};

export default module;