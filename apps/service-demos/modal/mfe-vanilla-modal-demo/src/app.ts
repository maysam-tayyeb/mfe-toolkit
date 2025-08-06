import type { MFEServices } from '@mfe-toolkit/core';

let cleanup: (() => void) | null = null;

export function createApp(element: HTMLElement, services: MFEServices) {
  const { modal, notification, logger } = services;
  const events: string[] = [];
  const eventHandlers: Array<() => void> = [];
  
  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    events.unshift(`[${timestamp}] ${event}`);
    if (events.length > 5) {
      events.splice(5);
    }
    updateEventLog();
    logger?.info(`Vanilla Modal Demo: ${event}`);
  };
  
  const updateEventLog = () => {
    const eventLog = element.querySelector('#event-log');
    if (!eventLog) return;
    
    if (events.length === 0) {
      eventLog.innerHTML = `
        <div class="text-sm text-muted-foreground">
          No events yet. Click a button to start.
        </div>
      `;
    } else {
      eventLog.innerHTML = events
        .map(event => `<div class="text-sm font-mono text-muted-foreground">${event}</div>`)
        .join('');
    }
  };
  
  const handleSimpleAlert = () => {
    addEvent('Opening simple alert...');
    (modal as any).open({
      title: 'Simple Alert',
      content: 'This is a simple alert from Vanilla TypeScript MFE. Pure JavaScript, no framework overhead!',
      actions: [
        {
          label: 'OK',
          variant: 'default',
          onClick: () => {
            addEvent('Alert closed');
          }
        }
      ]
    });
  };
  
  const handleConfirmation = async () => {
    addEvent('Opening confirmation dialog...');
    const result = await (modal as any).confirm({
      title: 'Confirmation Required',
      content: 'Are you sure you want to proceed? This demonstrates Vanilla TS integration with async/await support.',
      confirmLabel: 'Yes, Proceed',
      cancelLabel: 'Cancel'
    });
    addEvent(result ? 'User confirmed' : 'User cancelled');
  };
  
  const handleFormModal = () => {
    addEvent('Opening form modal...');
    (modal as any).open({
      title: 'Form Modal (Limited)',
      content: 'Vanilla TypeScript MFEs cannot render actual form elements in the modal. This is a cross-framework limitation. Only plain text content is supported.',
      actions: [
        {
          label: 'Understood',
          variant: 'default',
          onClick: () => {
            addEvent('Form modal closed');
          }
        }
      ]
    });
  };
  
  const handleCustomContent = () => {
    addEvent('Opening custom content modal...');
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
          onClick: () => {
            addEvent('Custom modal closed');
          }
        }
      ]
    });
  };
  
  const handleErrorExample = () => {
    addEvent('Showing error example...');
    notification.error('Error from Vanilla TypeScript MFE! No framework needed.');
    (modal as any).open({
      title: 'Error Example',
      content: 'This modal demonstrates error handling with pure TypeScript. Check the notification!',
      variant: 'destructive',
      actions: [
        {
          label: 'OK',
          variant: 'destructive',
          onClick: () => {
            addEvent('Error modal closed');
          }
        }
      ]
    });
  };
  
  const handleMultipleNotifications = () => {
    addEvent('Showing multiple notifications...');
    notification.success('Success from Vanilla TS!');
    setTimeout(() => notification.info('Info from Vanilla TS!'), 500);
    setTimeout(() => notification.warning('Warning from Vanilla TS!'), 1000);
    setTimeout(() => notification.error('Error from Vanilla TS!'), 1500);
  };
  
  const handleNestedModals = () => {
    addEvent('Opening nested modal attempt...');
    (modal as any).open({
      title: 'Nested Modals Not Supported',
      content: 'Vanilla TypeScript MFEs cannot create nested modals because we cannot pass DOM elements or event handlers to the React container. This is a framework boundary limitation.',
      actions: [
        {
          label: 'Understood',
          variant: 'default',
          onClick: () => {
            addEvent('Nested modal info closed');
          }
        }
      ]
    });
  };
  
  const handleSizeVariations = async () => {
    addEvent('Showing size variations...');
    
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
                addEvent(`Closed ${size} modal`);
                resolve();
              }
            }
          ]
        });
      });
    }
  };
  
  element.innerHTML = `
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Vanilla TS Modal Demo</h3>
        <span class="text-xs font-mono bg-muted px-2 py-1 rounded">
          Vanilla TypeScript
        </span>
      </div>
      
      <div class="space-y-3">
        <div class="text-sm font-medium text-muted-foreground mb-2">
          Test Modal Service:
        </div>
        <div class="grid grid-cols-2 gap-3" id="button-container">
          <button id="btn-simple" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Simple Alert
          </button>
          <button id="btn-confirm" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Confirmation Dialog
          </button>
          <button id="btn-form" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Form Modal
          </button>
          <button id="btn-custom" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Custom Content
          </button>
          <button id="btn-error" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Error Example
          </button>
          <button id="btn-notifications" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Multiple Notifications
          </button>
          <button id="btn-nested" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Nested Modals
          </button>
          <button id="btn-sizes" class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Size Variations
          </button>
        </div>
      </div>
      
      <div class="border border-border rounded-lg p-4 bg-card">
        <div class="text-sm font-medium mb-3">Event Log:</div>
        <div id="event-log" class="space-y-1">
          <div class="text-sm text-muted-foreground">
            No events yet. Click a button to start.
          </div>
        </div>
      </div>
      
      <div class="border border-border rounded-lg p-4 bg-muted/10">
        <div class="text-sm font-medium mb-2">Vanilla TypeScript Advantages:</div>
        <ul class="space-y-1 text-sm text-muted-foreground">
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
    { id: 'btn-sizes', handler: handleSizeVariations }
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
    eventHandlers.forEach(removeHandler => removeHandler());
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