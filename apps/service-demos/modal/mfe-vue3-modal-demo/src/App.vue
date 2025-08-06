<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Vue 3 Modal Demo</h3>
      <span class="text-xs font-mono bg-muted px-2 py-1 rounded">
        Vue {{ vueVersion }}
      </span>
    </div>

    <div class="space-y-3">
      <div class="text-sm font-medium text-muted-foreground mb-2">
        Test Modal Service:
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="button in buttons"
          :key="button.text"
          @click="button.handler"
          class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {{ button.text }}
        </button>
      </div>
    </div>

    <div class="border border-border rounded-lg p-4 bg-card">
      <div class="text-sm font-medium mb-3">Event Log:</div>
      <div class="space-y-1">
        <div v-if="events.length === 0" class="text-sm text-muted-foreground">
          No events yet. Click a button to start.
        </div>
        <div
          v-for="(event, index) in events"
          :key="index"
          class="text-sm font-mono text-muted-foreground"
        >
          {{ event }}
        </div>
      </div>
    </div>

    <div class="border border-border rounded-lg p-4 bg-muted/10">
      <div class="text-sm font-medium mb-2">Vue 3 Compatibility:</div>
      <ul class="space-y-1 text-sm text-muted-foreground">
        <li>✅ Basic modal operations work</li>
        <li>⚠️ Cannot pass Vue components as content</li>
        <li>⚠️ Limited to plain text content</li>
        <li>✅ Callbacks and promises work normally</li>
        <li>✅ All notification types supported</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, version as vueVersion } from 'vue';
import type { MFEServices } from '@mfe-toolkit/core';

const props = defineProps<{
  services: MFEServices
}>();

const events = ref<string[]>([]);
const { modal, notification, logger } = props.services;

const addEvent = (event: string) => {
  const timestamp = new Date().toLocaleTimeString();
  events.value.unshift(`[${timestamp}] ${event}`);
  if (events.value.length > 5) {
    events.value = events.value.slice(0, 5);
  }
  logger?.info(`Vue3 Modal Demo: ${event}`);
};

const handleSimpleAlert = () => {
  addEvent('Opening simple alert...');
  (modal as any).open({
    title: 'Simple Alert',
    content: 'This is a simple alert from Vue 3 MFE. Notice that we can only pass plain text content.',
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
    content: 'Are you sure you want to proceed? This action demonstrates Vue 3 MFE integration with the modal service.',
    confirmLabel: 'Yes, Proceed',
    cancelLabel: 'Cancel'
  });
  addEvent(result ? 'User confirmed' : 'User cancelled');
};

const handleFormModal = () => {
  addEvent('Opening form modal...');
  (modal as any).open({
    title: 'Form Modal (Limited)',
    content: 'Vue 3 MFEs cannot render actual form components in the modal. This is a limitation when crossing framework boundaries. Only plain text content is supported.',
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
    content: `Vue 3 Integration Details:
    
• Framework: Vue ${vueVersion}
• Bundle Size: ~50KB
• Content Type: Plain text only
• Event Handlers: Not supported in content
• Styling: Uses container styles

This demonstrates the limitations when passing content from Vue to React.`,
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
  notification.error('Error from Vue 3 MFE! This is a cross-framework notification.');
  (modal as any).open({
    title: 'Error Example',
    content: 'This modal demonstrates error handling. Check the notification that appeared!',
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
  notification.success('Success notification from Vue 3!');
  setTimeout(() => notification.info('Info notification from Vue 3!'), 500);
  setTimeout(() => notification.warning('Warning notification from Vue 3!'), 1000);
  setTimeout(() => notification.error('Error notification from Vue 3!'), 1500);
};

const handleNestedModals = () => {
  addEvent('Opening nested modal attempt...');
  (modal as any).open({
    title: 'Nested Modals Not Supported',
    content: 'Vue 3 MFEs cannot create nested modals because we cannot pass interactive content (buttons) to trigger nested modals. This is a framework boundary limitation.',
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
        content: `This is a ${size} sized modal from Vue 3 MFE. Notice how the modal adjusts its width based on the size prop.`,
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

const buttons = [
  { text: 'Simple Alert', handler: handleSimpleAlert },
  { text: 'Confirmation Dialog', handler: handleConfirmation },
  { text: 'Form Modal', handler: handleFormModal },
  { text: 'Custom Content', handler: handleCustomContent },
  { text: 'Error Example', handler: handleErrorExample },
  { text: 'Multiple Notifications', handler: handleMultipleNotifications },
  { text: 'Nested Modals', handler: handleNestedModals },
  { text: 'Size Variations', handler: handleSizeVariations }
];
</script>