import type { TemplateConfig, TemplateGenerator, ServiceConfig } from '../types';
import { getServiceConfig } from '../types';

export class SolidJSTemplate implements TemplateGenerator {
  private config: TemplateConfig;
  private serviceConfig: ServiceConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
    this.serviceConfig = getServiceConfig(config.serviceType || 'general', config.name);
  }

  generateMain(): string {
    const { name } = this.config;
    const { requiredServices, capabilities } = this.serviceConfig;
    const serviceType = this.config.serviceType || 'general';

    if (serviceType === 'modal') {
      return `import { render } from 'solid-js/web';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let dispose: (() => void) | null = null;

const module: MFEModule = {
  metadata: {
    name: '${name}',
    version: '1.0.0',
    requiredServices: ${JSON.stringify(requiredServices)},
    capabilities: ${JSON.stringify(capabilities)}
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    dispose = render(() => App({ services }), element);
    
    if (services.logger) {
      services.logger.info('[${name}] Mounted successfully with Solid.js');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (dispose) {
      dispose();
      dispose = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${name}] Unmounted successfully');
    }
  }
};

export default module;`;
    }

    // For non-modal services, use the standard template
    return `import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  metadata: {
    name: '${name}',
    version: '1.0.0',
    requiredServices: ${JSON.stringify(requiredServices)},
    capabilities: ${JSON.stringify(capabilities)}
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    const { render } = await import('solid-js/web');
    const { default: App } = await import('./App');
    
    const dispose = render(() => App({ services }), element);
    
    // Store dispose function for cleanup
    (element as any).__dispose = dispose;
    
    if (services.logger) {
      services.logger.info('[${name}] Mounted successfully with Solid.js');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    const element = document.querySelector('[data-mfe="${name}"]') as any;
    if (element && element.__dispose) {
      element.__dispose();
      delete element.__dispose;
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
    // Always generate simple hello world app
    return this.generateGeneralApp();
  }

  private generateModalApp(): string {
    const { name } = this.config;
    
    return `import { createSignal, createMemo, For } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export function App(props: AppProps) {
  const [modalCount, setModalCount] = createSignal(0);
  const [customTitle, setCustomTitle] = createSignal('Custom Modal');
  const [customContent, setCustomContent] = createSignal('This is custom modal content from Solid.js.');
  const [selectedSize, setSelectedSize] = createSignal<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isPending, setIsPending] = createSignal(false);
  
  const sizes = ['sm', 'md', 'lg', 'xl'] as const;

  const showModal = (config: any) => {
    if (!props.services.modal) {
      console.error('Modal service not available');
      return;
    }
    
    props.services.modal.show(config);
    setModalCount(c => c + 1);
  };

  const showSimpleModal = () => {
    showModal({
      title: 'Solid.js Modal',
      content: 'This modal is powered by Solid.js - fine-grained reactivity at its best!',
      showCloseButton: true
    });
  };

  const showConfirmModal = () => {
    showModal({
      title: 'Confirm Action',
      content: (
        <div>
          <p>Are you sure you want to proceed?</p>
          <p class="ds-text-sm ds-text-muted ds-mt-2">
            Triggered from Solid.js MFE with fine-grained reactivity
          </p>
        </div>
      ),
      onConfirm: () => {
        console.log('Confirmed from Solid.js!');
        props.services.modal?.close();
        props.services.notification?.show({
          title: 'Success',
          message: 'Action confirmed with Solid.js reactivity!',
          type: 'success'
        });
      },
      showCloseButton: true
    });
  };

  const showSizeModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    showModal({
      title: \`\${size.toUpperCase()} Modal\`,
      content: (
        <div>
          <p>This is a <strong>{size}</strong> modal.</p>
          <p class="ds-text-sm ds-text-muted ds-mt-2">
            Solid.js with compiled reactive primitives
          </p>
        </div>
      ),
      size,
      showCloseButton: true
    });
  };

  const showCustomModal = () => {
    showModal({
      title: customTitle(),
      content: <p>{customContent()}</p>,
      size: selectedSize(),
      showCloseButton: true
    });
  };

  const showFeatureModal = () => {
    showModal({
      title: 'Solid.js Features',
      content: (
        <div class="ds-space-y-4">
          <div class="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
            <h3 class="ds-font-semibold ds-mb-2">Fine-Grained Reactivity</h3>
            <ul class="ds-list-disc ds-list-inside ds-text-sm">
              <li>No Virtual DOM - direct updates</li>
              <li>Compiled reactive primitives</li>
              <li>createSignal, createMemo, createEffect</li>
              <li>Exceptional performance</li>
              <li>Small bundle size (~7kb)</li>
              <li>JSX without React</li>
            </ul>
          </div>
          <div class="ds-grid ds-grid-cols-3 ds-gap-2">
            <div class="ds-card-compact ds-text-center">
              <div class="ds-text-2xl">🔷</div>
              <div class="ds-text-xs">Solid.js</div>
            </div>
            <div class="ds-card-compact ds-text-center">
              <div class="ds-text-2xl">⚡</div>
              <div class="ds-text-xs">Fast</div>
            </div>
            <div class="ds-card-compact ds-text-center">
              <div class="ds-text-2xl">🎯</div>
              <div class="ds-text-xs">Precise</div>
            </div>
          </div>
        </div>
      ),
      size: 'lg',
      showCloseButton: true
    });
  };

  const showReactiveModal = () => {
    setIsPending(true);
    setTimeout(() => {
      showModal({
        title: 'Reactive Signals',
        content: (
          <div>
            <p>Solid.js uses signals for reactivity!</p>
            <div class="ds-mt-3 ds-p-2 ds-bg-accent-success-soft ds-rounded">
              <p class="ds-text-sm">Modal count (signal): {modalCount()}</p>
              <p class="ds-text-sm">Custom title: {customTitle()}</p>
              <p class="ds-text-sm">Selected size: {selectedSize()}</p>
            </div>
            <p class="ds-text-sm ds-text-muted ds-mt-2">
              Updates are fine-grained and efficient
            </p>
          </div>
        ),
        showCloseButton: true
      });
      setIsPending(false);
    }, 300);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-mb-6 ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔷 Solid.js Modal Demo
        </h1>
        <p class="ds-text-gray-600">
          Fine-Grained Reactive Modal Service
        </p>
        {isPending() && (
          <p class="ds-text-sm ds-text-warning ds-mt-2">
            Processing...
          </p>
        )}
      </div>

      <div class="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div class="ds-card-compact ds-text-center">
          <div class="ds-text-2xl ds-font-bold ds-text-accent-primary">{modalCount()}</div>
          <div class="ds-text-sm ds-text-gray-600">Modals Opened</div>
        </div>
        <div class="ds-card-compact ds-text-center">
          <div class="ds-text-2xl">🔷</div>
          <div class="ds-text-sm ds-text-gray-600">Solid.js</div>
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
            <button onClick={showSimpleModal} class="ds-btn-primary">
              Simple Modal
            </button>
            <button onClick={showConfirmModal} class="ds-btn-success">
              Confirm Dialog
            </button>
            <button onClick={showFeatureModal} class="ds-btn-secondary">
              Features
            </button>
            <button onClick={showReactiveModal} class="ds-btn-warning">
              Reactive Signals
            </button>
          </div>
        </div>

        <div>
          <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Modal Sizes</h3>
          <div class="ds-flex ds-gap-2">
            <For each={sizes}>
              {(size) => (
                <button 
                  onClick={() => showSizeModal(size)} 
                  class="ds-btn-outline ds-btn-sm"
                >
                  {size.toUpperCase()}
                </button>
              )}
            </For>
          </div>
        </div>

        <div>
          <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Custom Modal</h3>
          <div class="ds-space-y-3">
            <input
              type="text"
              value={customTitle()}
              onInput={(e) => setCustomTitle(e.currentTarget.value)}
              class="ds-input"
              placeholder="Modal title"
            />
            <textarea
              value={customContent()}
              onInput={(e) => setCustomContent(e.currentTarget.value)}
              class="ds-textarea"
              rows={2}
              placeholder="Modal content"
            />
            <select 
              value={selectedSize()}
              onChange={(e) => setSelectedSize(e.currentTarget.value as any)}
              class="ds-select"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
            <button onClick={showCustomModal} class="ds-btn-primary">
              Show Custom Modal
            </button>
          </div>
        </div>
      </div>

      <div class="ds-mt-6 ds-pt-4 ds-border-t ds-text-center ds-text-sm ds-text-gray-500">
        Solid.js Modal Service Demo • Fine-Grained Reactivity
      </div>
    </div>
  );
}`;
  }

  private generateNotificationApp(): string {
    return `import { createSignal } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export default function App(props: AppProps) {
  const [notificationCount, setNotificationCount] = createSignal(0);

  const showNotification = (type: 'success' | 'info' | 'warning' | 'error') => {
    props.services.notification?.show({
      title: \`\${type.charAt(0).toUpperCase() + type.slice(1)} Notification\`,
      message: \`This is a \${type} notification from Solid.js\`,
      type
    });
    setNotificationCount(c => c + 1);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-mb-6 ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔔 Solid.js Notifications
        </h1>
        <p class="ds-text-gray-600">Notification Service Demo</p>
      </div>

      <div class="ds-text-center ds-mb-6">
        <div class="ds-text-3xl ds-font-bold">{notificationCount()}</div>
        <div class="ds-text-sm ds-text-gray-600">Notifications Sent</div>
      </div>

      <div class="ds-flex ds-flex-wrap ds-gap-2 ds-justify-center">
        <button onClick={() => showNotification('success')} class="ds-btn-success">
          Success
        </button>
        <button onClick={() => showNotification('info')} class="ds-btn-primary">
          Info
        </button>
        <button onClick={() => showNotification('warning')} class="ds-btn-warning">
          Warning
        </button>
        <button onClick={() => showNotification('error')} class="ds-btn-danger">
          Error
        </button>
      </div>
    </div>
  );
}`;
  }

  private generateGeneralApp(): string {
    const { name } = this.config;
    
    return `import { createSignal } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export default function App(props: AppProps) {
  const [count, setCount] = createSignal(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    props.services.logger?.info(\`Button clicked! Count: \${count() + 1}\`);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔷 Hello from ${name}!
        </h1>
        <p class="ds-text-gray-600 ds-mb-6">
          Solid.js • Fine-Grained Reactivity
        </p>
        <div class="ds-card-compact ds-inline-block ds-p-4">
          <div class="ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2">
            {count()}
          </div>
          <button class="ds-btn-primary" onClick={handleClick}>
            Click me!
          </button>
        </div>
      </div>
    </div>
  );
}`;
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
        '@mfe-toolkit/core': 'workspace:*',
        'solid-js': '^1.8.0'
      },
      devDependencies: {
        '@mfe-toolkit/build': 'workspace:*',
        'esbuild': '^0.24.2',
        'esbuild-plugin-solid': '^0.6.0',
        'typescript': '^5.3.0'
      }
    };
  }

  generateManifest(): object {
    const { name, projectPath } = this.config;
    const { requiredServices, emits, listens, features, eventNamespace } = this.serviceConfig;
    
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
          'solid-js': '^1.8.0'
        },
        peer: {
          '@mfe-toolkit/core': '^0.1.0'
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
          'solid-js': '^1.8.0'
        }
      },
      capabilities: {
        emits,
        listens,
        features: [...features, 'solid-signals', 'fine-grained-reactivity', 'no-virtual-dom']
      },
      requirements: {
        services: requiredServices.map(name => ({ name, optional: name === 'logger' }))
      },
      metadata: {
        displayName: `Solid.js ${this.config.serviceType === 'modal' ? 'Modal' : this.config.serviceType === 'notification' ? 'Notification' : ''} Demo`.trim(),
        description: `${this.config.serviceType || 'General'} service demonstration MFE built with Solid.js`,
        icon: '🔷',
        author: { name: 'MFE Toolkit Team' },
        category: projectPath.includes('service-demos') ? 'service-demos' : 'custom',
        tags: [this.config.serviceType || 'demo', 'solidjs', 'service', 'reactive']
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
import { solidPlugin } from 'esbuild-plugin-solid';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/${name}.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [solidPlugin()]
  }
});`;
  }

  generateTsConfig(): object {
    return {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        jsx: 'preserve',
        jsxImportSource: 'solid-js',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: false,
        noEmit: true,
        resolveJsonModule: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
  }

  generateReadme(): string {
    const { name, serviceType } = this.config;
    
    return `# ${name}

## Description
Solid.js ${serviceType || 'general'} microfrontend with fine-grained reactivity and exceptional performance.

## Features
- Solid.js with signals and reactive primitives
- No Virtual DOM - direct DOM updates
- Fine-grained reactivity system
- Compiled reactive primitives
- Small bundle size (~7kb)
- ${serviceType === 'modal' ? 'Modal service integration' : serviceType === 'notification' ? 'Notification service integration' : 'General MFE functionality'}
- Design system integration
- TypeScript support

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

## Solid.js Specifics
This MFE leverages Solid.js's unique features:
- \`createSignal()\` for reactive state
- \`createMemo()\` for computed values
- \`createEffect()\` for side effects
- JSX compiled to efficient DOM operations
- No re-renders, only precise updates

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
`;
  }
}