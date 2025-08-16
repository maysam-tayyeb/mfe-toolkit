<template>
  <div class="ds-card ds-p-6 ds-m-4">
    <div class="ds-mb-6 ds-text-center">
      <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
        💚 Vue 3 Modal Demo
      </h1>
      <p class="ds-text-gray-600">
        Composition API with Modal Service
      </p>
      <p v-if="isPending" class="ds-text-sm ds-text-warning ds-mt-2">
        Processing...
      </p>
    </div>

    <div class="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
      <div class="ds-card-compact ds-text-center">
        <div class="ds-text-2xl ds-font-bold ds-text-accent-primary">{{ modalCount }}</div>
        <div class="ds-text-sm ds-text-gray-600">Modals Opened</div>
      </div>
      <div class="ds-card-compact ds-text-center">
        <div class="ds-text-2xl">💚</div>
        <div class="ds-text-sm ds-text-gray-600">Vue 3</div>
      </div>
      <div class="ds-card-compact ds-text-center">
        <div class="ds-text-2xl">⚡</div>
        <div class="ds-text-sm ds-text-gray-600">Reactive</div>
      </div>
    </div>

    <div class="ds-space-y-4">
      <div>
        <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Modal Types</h3>
        <div class="ds-flex ds-flex-wrap ds-gap-2">
          <button @click="showSimpleModal" class="ds-btn-primary">
            Simple Modal
          </button>
          <button @click="showConfirmModal" class="ds-btn-success">
            Confirm Dialog
          </button>
          <button @click="showFeatureModal" class="ds-btn-secondary">
            Features
          </button>
          <button @click="showReactiveModal" class="ds-btn-warning">
            Reactive Data
          </button>
        </div>
      </div>

      <div>
        <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Modal Sizes</h3>
        <div class="ds-flex ds-gap-2">
          <button 
            v-for="size in sizes" 
            :key="size"
            @click="showSizeModal(size)" 
            class="ds-btn-outline ds-btn-sm"
          >
            {{ size.toUpperCase() }}
          </button>
        </div>
      </div>

      <div>
        <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Custom Modal</h3>
        <div class="ds-space-y-3">
          <input
            v-model="customTitle"
            type="text"
            class="ds-input"
            placeholder="Modal title"
          />
          <textarea
            v-model="customContent"
            class="ds-textarea"
            rows="2"
            placeholder="Modal content"
          />
          <select v-model="selectedSize" class="ds-select">
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra Large</option>
          </select>
          <button @click="showCustomModal" class="ds-btn-primary">
            Show Custom Modal
          </button>
        </div>
      </div>
    </div>

    <div class="ds-mt-6 ds-pt-4 ds-border-t ds-text-center ds-text-sm ds-text-gray-500">
      Vue 3 Modal Service Demo • Composition API
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue';
import type { MFEServices } from '@mfe-toolkit/core';

interface Props {
  services: MFEServices;
}

const props = defineProps<Props>();
const modalCount = ref(0);
const customTitle = ref('Custom Modal');
const customContent = ref('This is custom modal content from Vue 3.');
const selectedSize = ref<'sm' | 'md' | 'lg' | 'xl'>('md');
const isPending = ref(false);
const sizes = ['sm', 'md', 'lg', 'xl'] as const;

const showModal = (config: any) => {
  if (!props.services.modal) {
    console.error('Modal service not available');
    return;
  }
  
  props.services.modal.show(config);
  modalCount.value++;
};

const showSimpleModal = () => {
  showModal({
    title: 'Vue 3 Modal',
    content: h('p', {}, 'This modal is powered by Vue 3 Composition API!'),
    showCloseButton: true
  });
};

const showConfirmModal = () => {
  showModal({
    title: 'Confirm Action',
    content: h('div', {}, [
      h('p', {}, 'Are you sure you want to proceed?'),
      h('p', { class: 'ds-text-sm ds-text-muted ds-mt-2' }, 
        'Triggered from Vue 3 MFE with Composition API'
      )
    ]),
    onConfirm: () => {
      console.log('Confirmed from Vue 3!');
      props.services.modal?.close();
      props.services.notification?.show({
        title: 'Success',
        message: 'Action confirmed from Vue 3!',
        type: 'success'
      });
    },
    showCloseButton: true
  });
};

const showSizeModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  showModal({
    title: `${size.toUpperCase()} Modal`,
    content: h('div', {}, [
      h('p', {}, [
        'This is a ',
        h('strong', {}, size),
        ' modal.'
      ]),
      h('p', { class: 'ds-text-sm ds-text-muted ds-mt-2' }, 
        'Vue 3 with reactive state management'
      )
    ]),
    size,
    showCloseButton: true
  });
};

const showCustomModal = () => {
  showModal({
    title: customTitle.value,
    content: h('p', {}, customContent.value),
    size: selectedSize.value,
    showCloseButton: true
  });
};

const showFeatureModal = () => {
  showModal({
    title: 'Vue 3 Features',
    content: h('div', { class: 'ds-space-y-4' }, [
      h('div', { class: 'ds-bg-accent-primary-soft ds-p-3 ds-rounded' }, [
        h('h3', { class: 'ds-font-semibold ds-mb-2' }, 'Composition API'),
        h('ul', { class: 'ds-list-disc ds-list-inside ds-text-sm' }, [
          h('li', {}, 'Reactive refs and computed'),
          h('li', {}, 'Setup script syntax'),
          h('li', {}, 'TypeScript support'),
          h('li', {}, 'Teleport for modals'),
          h('li', {}, 'Fragments support'),
          h('li', {}, 'Improved performance')
        ])
      ]),
      h('div', { class: 'ds-grid ds-grid-cols-3 ds-gap-2' }, [
        h('div', { class: 'ds-card-compact ds-text-center' }, [
          h('div', { class: 'ds-text-2xl' }, '💚'),
          h('div', { class: 'ds-text-xs' }, 'Vue 3')
        ]),
        h('div', { class: 'ds-card-compact ds-text-center' }, [
          h('div', { class: 'ds-text-2xl' }, '⚡'),
          h('div', { class: 'ds-text-xs' }, 'Fast')
        ]),
        h('div', { class: 'ds-card-compact ds-text-center' }, [
          h('div', { class: 'ds-text-2xl' }, '🎯'),
          h('div', { class: 'ds-text-xs' }, 'Reactive')
        ])
      ])
    ]),
    size: 'lg',
    showCloseButton: true
  });
};

const showReactiveModal = () => {
  isPending.value = true;
  setTimeout(() => {
    showModal({
      title: 'Reactive Data Modal',
      content: h('div', {}, [
        h('p', {}, 'This modal demonstrates Vue 3 reactivity!'),
        h('div', { class: 'ds-mt-3 ds-p-2 ds-bg-accent-success-soft ds-rounded' }, [
          h('p', { class: 'ds-text-sm' }, `Modal count (reactive): ${modalCount.value}`),
          h('p', { class: 'ds-text-sm' }, `Custom title: ${customTitle.value}`),
          h('p', { class: 'ds-text-sm' }, `Selected size: ${selectedSize.value}`)
        ])
      ]),
      showCloseButton: true
    });
    isPending.value = false;
  }, 500);
};
</script>