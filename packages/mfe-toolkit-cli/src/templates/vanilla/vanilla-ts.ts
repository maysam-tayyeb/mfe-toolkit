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
    
    let clickCount = 0;

    element.innerHTML = \`
      <div class="ds-card ds-p-6 ds-m-4">
        <div class="ds-text-center">
          <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
            📦 Hello from ${name}!
          </h1>
          <p class="ds-text-gray-600 ds-mb-6">
            Vanilla TypeScript MFE • Zero Dependencies
          </p>
          
          <div class="ds-card-compact ds-inline-block ds-p-4">
            <div class="ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2">
              <span id="counter">0</span>
            </div>
            <button id="increment-btn" class="ds-btn-primary">
              Click me!
            </button>
          </div>
          
          <p class="ds-text-sm ds-text-gray-500 ds-mt-6">
            Built with ❤️ using MFE Toolkit
          </p>
        </div>
      </div>
    \`;
    
    element.querySelector('#increment-btn')?.addEventListener('click', () => {
      clickCount++;
      const counterEl = element.querySelector('#counter');
      if (counterEl) counterEl.textContent = String(clickCount);
      services.logger?.info(\`Button clicked! Count: \${clickCount}\`);
    });
    
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
        dev: 'mfe-dev',
        build: 'node build.js',
        'build:watch': 'node build.js --watch',
        clean: 'rm -rf dist'
      },
      dependencies: {
        '@mfe-toolkit/core': 'workspace:*'
      },
      devDependencies: {
        '@mfe-toolkit/build': 'workspace:*',
        '@mfe-toolkit/dev': 'workspace:*',
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