import type { TemplateConfig, TemplateGenerator, ServiceConfig } from '../types';
import { getServiceConfig } from '../types';

export class VanillaTypeScriptTemplate implements TemplateGenerator {
  private config: TemplateConfig;
  private serviceConfig: ServiceConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
    this.serviceConfig = getServiceConfig(config.serviceType || 'general', config.name);
  }

  generateMain(): string {
    const { name } = this.config;
    const { requiredServices, capabilities } = this.serviceConfig;
    const isModal = this.config.serviceType === 'modal';

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
    ${isModal ? `
    let modalCount = 0;

    element.innerHTML = \`
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
    \`;

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
        content: \`
          <div class="ds-space-y-2">
            <p>This is custom HTML content</p>
            <div class="ds-bg-accent-primary-soft ds-p-2 ds-rounded">
              <p class="ds-text-sm">Modal count: \${modalCount + 1}</p>
            </div>
          </div>
        \`,
        size: 'lg',
        showCloseButton: true
      });
      modalCount++;
      updateCount();
    });` : `
    element.innerHTML = \`
      <div class="ds-card ds-p-6 ds-m-4">
        <h1 class="ds-text-2xl ds-font-bold ds-text-center ds-mb-4">
          📦 ${name}
        </h1>
        <p class="ds-text-center">Vanilla TypeScript MFE</p>
      </div>
    \`;`}
    
    if (services.logger) {
      services.logger.info('[${name}] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${name}] Unmounted successfully');
    }
  }
};

export default module;`;
  }

  generateApp(): string {
    return ''; // Vanilla TS doesn't need a separate App file
  }

  generatePackageJson(): object {
    return {
      name: `@mfe/${this.config.name}`,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        build: 'node build.js',
        'build:watch': 'node build.js --watch',
        clean: 'rm -rf dist'
      },
      dependencies: {
        '@mfe-toolkit/core': 'workspace:*'
      },
      devDependencies: {
        '@mfe-toolkit/build': 'workspace:*',
        'esbuild': '^0.24.2',
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
      dependencies: { runtime: {}, peer: { '@mfe-toolkit/core': '^0.1.0' } },
      compatibility: {
        container: '^1.0.0',
        browsers: { chrome: '>=90', firefox: '>=88', safari: '>=14', edge: '>=90' }
      },
      capabilities: { emits, listens, features: [...features, 'vanilla-ts'] },
      requirements: { services: requiredServices.map(name => ({ name, optional: name === 'logger' })) },
      metadata: {
        displayName: `Vanilla TS ${this.config.serviceType || ''} Demo`.trim(),
        description: `${this.config.serviceType || 'General'} service demo with Vanilla TypeScript`,
        icon: '📦',
        author: { name: 'MFE Toolkit Team' },
        category: projectPath.includes('service-demos') ? 'service-demos' : 'custom',
        tags: [this.config.serviceType || 'demo', 'vanilla-ts', 'service']
      },
      config: {
        loading: { timeout: 30000, retries: 3, retryDelay: 1000, priority: 5, preload: false, lazy: true },
        runtime: { isolation: 'none', keepAlive: false, singleton: true },
        communication: { eventNamespace }
      }
    };
  }

  generateBuildScript(): string {
    return `import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/${this.config.name}.js',
  manifestPath: './manifest.json'
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
        resolveJsonModule: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
  }

  generateReadme(): string {
    return `# ${this.config.name}\n\nVanilla TypeScript MFE with zero framework dependencies.`;
  }
}