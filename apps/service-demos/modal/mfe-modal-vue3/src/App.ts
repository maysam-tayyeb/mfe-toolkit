import { defineComponent, ref, h } from 'vue';
import type { MFEServices } from '@mfe-toolkit/core';

export const App = defineComponent({
  props: {
    services: {
      type: Object as () => MFEServices,
      required: true
    }
  },
  setup(props) {
    const count = ref(0);

    const handleClick = () => {
      count.value++;
      props.services.logger?.info(`Button clicked! Count: ${count.value}`);
    };

    return () => h('div', { class: 'ds-card ds-p-6 ds-m-4' }, [
      h('div', { class: 'ds-text-center' }, [
        h('h1', { class: 'ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary' }, 
          `🎉 Hello from mfe-modal-vue3!`
        ),
        h('p', { class: 'ds-text-gray-600 ds-mb-6' }, 
          'Vue 3 MFE • Composition API'
        ),
        h('div', { class: 'ds-card-compact ds-inline-block ds-p-4' }, [
          h('div', { class: 'ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2' }, 
            count.value
          ),
          h('button', {
            class: 'ds-btn-primary',
            onClick: handleClick
          }, 'Click me!')
        ]),
        h('p', { class: 'ds-text-sm ds-text-gray-500 ds-mt-6' }, 
          'Built with ❤️ using MFE Toolkit'
        )
      ])
    ]);
  }
});