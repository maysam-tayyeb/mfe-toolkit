<template>
  <div class="ds-p-4">
    <h2 class="ds-text-2xl ds-font-bold ds-mb-4">
      mfe-modal-vue3 MFE
    </h2>
    <p class="ds-text-gray-600 ds-mb-4">
      This MFE was created with mfe-toolkit-cli
    </p>
    <button 
      @click="handleNotification"
      class="ds-btn-primary"
    >
      Show Notification
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MFEServices } from '@mfe-toolkit/core';

interface Props {
  services: MFEServices;
}

const props = defineProps<Props>();

const handleNotification = () => {
  props.services.notification?.show({
    title: 'Hello from mfe-modal-vue3',
    message: 'This is a notification from the Vue MFE',
    type: 'success'
  });
};
</script>