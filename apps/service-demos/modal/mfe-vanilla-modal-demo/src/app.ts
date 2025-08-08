import type { MFEServices } from '@mfe-toolkit/core';

let cleanup: (() => void) | null = null;

export function createApp(element: HTMLElement, services: MFEServices) {
  const { modal, notification } = services;
  const eventHandlers: Array<() => void> = [];

  const handleSimpleAlert = () => {
    (modal as any).open({
      title: 'Simple Alert',
      content:
        'This is a simple alert from Vanilla TypeScript MFE. Pure JavaScript, no framework overhead!',
      actions: [
        {
          label: 'OK',
          variant: 'default',
        },
      ],
    });
  };

  const handleConfirmation = async () => {
    await (modal as any).confirm({
      title: 'Confirmation Required',
      content:
        'Are you sure you want to proceed? This demonstrates Vanilla TS integration with async/await support.',
      confirmLabel: 'Yes, Proceed',
      cancelLabel: 'Cancel',
    });
  };

  const handleFormModal = () => {
    (modal as any).open({
      title: 'Form Modal (Limited)',
      content:
        'Vanilla TypeScript MFEs cannot render actual form elements in the modal. This is a cross-framework limitation. Only plain text content is supported.',
      actions: [
        {
          label: 'Understood',
          variant: 'default',
        },
      ],
    });
  };

  const handleCustomContent = () => {
    (modal as any).open({
      title: 'Custom Content (Text Only)',
      content: `Vanilla TypeScript Details:
    
• Framework: None (Pure TypeScript)
• Bundle Size: ~5-10KB
• Content Type: Plain text only
• DOM Management: Manual
• Type Safety: Full TypeScript support

This is the most lightweight implementation possible!`,
      size: 'lg',
      actions: [
        {
          label: 'Close',
          variant: 'default',
        },
      ],
    });
  };

  const handleErrorExample = () => {
    notification.error('Error from Vanilla TypeScript MFE! No framework needed.');
    (modal as any).open({
      title: 'Error Example',
      content:
        'This modal demonstrates error handling with pure TypeScript. Check the notification!',
      variant: 'destructive',
      actions: [
        {
          label: 'OK',
          variant: 'destructive',
        },
      ],
    });
  };

  const handleMultipleNotifications = () => {
    notification.success('Success from Vanilla TS!');
    setTimeout(() => notification.info('Info from Vanilla TS!'), 500);
    setTimeout(() => notification.warning('Warning from Vanilla TS!'), 1000);
    setTimeout(() => notification.error('Error from Vanilla TS!'), 1500);
  };

  const handleNestedModals = () => {
    (modal as any).open({
      title: 'Nested Modals Not Supported',
      content:
        'Vanilla TypeScript MFEs cannot create nested modals because we cannot pass DOM elements or event handlers to the React container. This is a framework boundary limitation.',
      actions: [
        {
          label: 'Understood',
          variant: 'default',
        },
      ],
    });
  };

  const handleSizeVariations = async () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];

    for (const size of sizes) {
      await new Promise<void>((resolve) => {
        (modal as any).open({
          title: `Modal Size: ${size.toUpperCase()}`,
          content: `This is a ${size} sized modal from Vanilla TypeScript. The smallest bundle size, the best performance!`,
          size,
          actions: [
            {
              label: 'Next',
              variant: 'default',
              onClick: () => {
                resolve();
              },
            },
          ],
        });
      });
    }
  };

  element.innerHTML = `
    <div class="ds-card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="ds-card-title">Vanilla TS Modal Demo</h3>
        <span class="text-xs font-mono bg-muted px-2 py-1 rounded">
          Vanilla TypeScript
        </span>
      </div>
      
      <div class="ds-stack mb-4">
        <div class="ds-label mb-2">
          Test Modal Service:
        </div>
        <div class="grid grid-cols-2 gap-3" id="button-container">
          <button id="btn-simple" class="ds-button-primary">
            Simple Alert
          </button>
          <button id="btn-confirm" class="ds-button-primary">
            Confirmation Dialog
          </button>
          <button id="btn-form" class="ds-button-primary">
            Form Modal
          </button>
          <button id="btn-custom" class="ds-button-primary">
            Custom Content
          </button>
          <button id="btn-error" class="ds-button-primary">
            Error Example
          </button>
          <button id="btn-notifications" class="ds-button-primary">
            Multiple Notifications
          </button>
          <button id="btn-nested" class="ds-button-primary">
            Nested Modals
          </button>
          <button id="btn-sizes" class="ds-button-primary">
            Size Variations
          </button>
        </div>
      </div>
      
      
      <div class="ds-card bg-muted/10">
        <div class="ds-card-title mb-2">Vanilla TypeScript Advantages:</div>
        <ul class="space-y-1 ds-text-small ds-text-muted">
          <li>✅ Smallest bundle size (~5-10KB)</li>
          <li>✅ No framework overhead</li>
          <li>✅ Full TypeScript support</li>
          <li>✅ Direct DOM manipulation</li>
          <li>⚠️ Limited to plain text content in modals</li>
        </ul>
      </div>
    </div>
  `;

  const buttonHandlers = [
    { id: 'btn-simple', handler: handleSimpleAlert },
    { id: 'btn-confirm', handler: handleConfirmation },
    { id: 'btn-form', handler: handleFormModal },
    { id: 'btn-custom', handler: handleCustomContent },
    { id: 'btn-error', handler: handleErrorExample },
    { id: 'btn-notifications', handler: handleMultipleNotifications },
    { id: 'btn-nested', handler: handleNestedModals },
    { id: 'btn-sizes', handler: handleSizeVariations },
  ];

  buttonHandlers.forEach(({ id, handler }) => {
    const button = element.querySelector(`#${id}`);
    if (button) {
      const boundHandler = handler.bind(null);
      button.addEventListener('click', boundHandler);
      eventHandlers.push(() => button.removeEventListener('click', boundHandler));
    }
  });

  cleanup = () => {
    eventHandlers.forEach((removeHandler) => removeHandler());
    eventHandlers.length = 0;
  };
}

export function destroyApp(element: HTMLElement) {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  element.innerHTML = '';
}
