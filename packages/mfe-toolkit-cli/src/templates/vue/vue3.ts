import type { TemplateConfig, TemplateGenerator, ServiceConfig } from '../types';
import { getServiceConfig, getFrameworkIcon } from '../types';

export class Vue3Template implements TemplateGenerator {
  private config: TemplateConfig;
  private serviceConfig: ServiceConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
    this.serviceConfig = getServiceConfig(config.serviceType || 'general', config.name);
  }

  generateMain(): string {
    const { name } = this.config;
    const { requiredServices, capabilities } = this.serviceConfig;

    return `import { createApp } from 'vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import App from './App.vue';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: '${name}',
    version: '1.0.0',
    requiredServices: ${JSON.stringify(requiredServices)},
    capabilities: ${JSON.stringify(capabilities)}
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    app = createApp(App, { services });
    app.mount(element);
    
    if (services.logger) {
      services.logger.info('[${name}] Mounted successfully with Vue 3');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${name}] Unmounted successfully');
    }
  }
};

export default module;`;
  }

  generateApp(): string {
    const { name, serviceType } = this.config;
    
    if (serviceType === 'modal') {
      return this.generateModalApp();
    } else if (serviceType === 'notification') {
      return this.generateNotificationApp();
    }
    
    return this.generateGeneralApp();
  }

  private generateModalApp(): string {
    const { name } = this.config;
    
    return `<template>
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
    title: \`\${size.toUpperCase()} Modal\`,
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
          h('p', { class: 'ds-text-sm' }, \`Modal count (reactive): \${modalCount.value}\`),
          h('p', { class: 'ds-text-sm' }, \`Custom title: \${customTitle.value}\`),
          h('p', { class: 'ds-text-sm' }, \`Selected size: \${selectedSize.value}\`)
        ])
      ]),
      showCloseButton: true
    });
    isPending.value = false;
  }, 500);
};
</script>`;
  }

  private generateNotificationApp(): string {
    return `<template>
  <div class="ds-card ds-p-6 ds-m-4">
    <div class="ds-mb-6 ds-text-center">
      <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
        🔔 Vue 3 Notifications
      </h1>
      <p class="ds-text-gray-600">Notification Service Demo</p>
    </div>

    <div class="ds-text-center ds-mb-6">
      <div class="ds-text-3xl ds-font-bold">{{ notificationCount }}</div>
      <div class="ds-text-sm ds-text-gray-600">Notifications Sent</div>
    </div>

    <div class="ds-flex ds-flex-wrap ds-gap-2 ds-justify-center">
      <button @click="showNotification('success')" class="ds-btn-success">
        Success
      </button>
      <button @click="showNotification('info')" class="ds-btn-primary">
        Info
      </button>
      <button @click="showNotification('warning')" class="ds-btn-warning">
        Warning
      </button>
      <button @click="showNotification('error')" class="ds-btn-danger">
        Error
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MFEServices } from '@mfe-toolkit/core';

interface Props {
  services: MFEServices;
}

const props = defineProps<Props>();
const notificationCount = ref(0);

const showNotification = (type: 'success' | 'info' | 'warning' | 'error') => {
  props.services.notification?.show({
    title: \`\${type.charAt(0).toUpperCase() + type.slice(1)} Notification\`,
    message: \`This is a \${type} notification from Vue 3\`,
    type
  });
  notificationCount.value++;
};
</script>`;
  }

  private generateGeneralApp(): string {
    const { name } = this.config;
    
    return `<template>
  <div class="ds-card ds-p-6 ds-m-4">
    <div class="ds-mb-6 ds-text-center">
      <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
        💚 {{ name }}
      </h1>
      <p class="ds-text-gray-600">Vue 3 with Composition API</p>
    </div>

    <div class="ds-text-center ds-mb-6">
      <div class="ds-text-3xl ds-font-bold">{{ count }}</div>
      <div class="ds-text-sm ds-text-gray-600">Counter Value</div>
    </div>

    <div class="ds-bg-accent-primary-soft ds-p-3 ds-rounded ds-mb-4">
      <p class="ds-text-sm">{{ message }}</p>
    </div>

    <div class="ds-flex ds-gap-2 ds-justify-center">
      <button @click="increment" class="ds-btn-primary">
        Increment
      </button>
      <button @click="reset" class="ds-btn-outline">
        Reset
      </button>
      <button @click="handleLog" class="ds-btn-secondary">
        Log Count
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { MFEServices } from '@mfe-toolkit/core';

interface Props {
  services: MFEServices;
}

const props = defineProps<Props>();
const name = '${name}';
const count = ref(0);
const message = ref('Welcome to Vue 3 MFE!');

const increment = () => {
  count.value++;
};

const reset = () => {
  count.value = 0;
};

const handleLog = () => {
  props.services.logger?.info(\`[\${name}] Count is \${count.value}\`);
  message.value = \`Logged count: \${count.value}\`;
};
</script>`;
  }

  generatePackageJson(): object {
    const { name } = this.config;
    
    return {
      name: `@mfe/${name}`,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        build: 'node build.js',
        'build:watch': 'node build.js --watch',
        clean: 'rm -rf dist'
      },
      dependencies: {
        'vue': '^3.4.0'
      },
      devDependencies: {
        '@mfe-toolkit/build': 'workspace:*',
        '@vitejs/plugin-vue': '^5.0.0',
        'esbuild': '^0.24.2',
        'typescript': '^5.3.0'
      }
    };
  }

  generateManifest(): object {
    const { name, projectPath } = this.config;
    const { requiredServices, capabilities, emits, listens, features, eventNamespace } = this.serviceConfig;
    
    const urlPath = projectPath.includes('service-demos') 
      ? `service-demos/${this.config.serviceType}/${name}` 
      : name;

    return {
      $schema: 'https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json',
      name,
      version: '1.0.0',
      url: `http://localhost:8080/${urlPath}/${name}.js`,
      alternativeUrls: [],
      dependencies: {
        runtime: {
          'vue': '^3.4.0'
        },
        peer: {
          '@mfe-toolkit/build': '^0.1.0'
        }
      },
      compatibility: {
        container: '^1.0.0',
        browsers: {
          chrome: '>=90',
          firefox: '>=88',
          safari: '>=14',
          edge: '>=90'
        },
        frameworks: {
          vue: '^3.4.0'
        }
      },
      capabilities: {
        emits,
        listens,
        features: [...features, 'vue3-composition-api', 'reactive-state']
      },
      requirements: {
        services: requiredServices.map(name => ({ name, optional: name === 'logger' }))
      },
      metadata: {
        displayName: `Vue 3 ${this.config.serviceType === 'modal' ? 'Modal' : this.config.serviceType === 'notification' ? 'Notification' : ''} Demo`.trim(),
        description: `${this.config.serviceType || 'General'} service demonstration MFE built with Vue 3`,
        icon: '💚',
        author: { name: 'MFE Toolkit Team' },
        category: projectPath.includes('service-demos') ? 'service-demos' : 'custom',
        tags: [this.config.serviceType || 'demo', 'vue3', 'service', 'composition-api']
      },
      config: {
        loading: {
          timeout: 30000,
          retries: 3,
          retryDelay: 1000,
          priority: 5,
          preload: false,
          lazy: true
        },
        runtime: {
          isolation: 'none',
          keepAlive: false,
          singleton: true
        },
        communication: {
          eventNamespace
        }
      }
    };
  }

  generateBuildScript(): string {
    const { name } = this.config;
    
    return `import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/${name}.js',
  manifestPath: './manifest.json',
  loader: {
    '.vue': 'text'
  }
});`;
  }

  generateTsConfig(): object {
    return {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: false,
        noEmit: true,
        resolveJsonModule: true,
        jsx: 'preserve'
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
  }

  generateReadme(): string {
    const { name, serviceType } = this.config;
    
    return `# ${name}

## Description
Vue 3 ${serviceType || 'general'} microfrontend with Composition API and reactive state management.

## Features
- Vue 3 with Composition API
- Script setup syntax
- TypeScript support
- Reactive state management
- ${serviceType === 'modal' ? 'Modal service integration' : serviceType === 'notification' ? 'Notification service integration' : 'General MFE functionality'}
- Design system integration

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Build in watch mode
pnpm build:watch

# Clean build artifacts
pnpm clean
\`\`\`

## Vue 3 Specifics
This MFE leverages Vue 3's modern features:
- Composition API for better logic composition
- \`<script setup>\` for cleaner component code
- Improved TypeScript integration
- Teleport for modal rendering
- Fragment support

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
`;
  }
}