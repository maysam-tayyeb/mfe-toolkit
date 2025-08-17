import type { TemplateConfig, TemplateGenerator, ServiceConfig } from '../types';
import { getServiceConfig } from '../types';

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

    return `import { createApp, h } from 'vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

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
    
    app = createApp({
      render() {
        return h(App, { services });
      }
    });
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
    const { name } = this.config;
    
    return `import { defineComponent, ref, h } from 'vue';
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
      props.services.logger?.info(\`Button clicked! Count: \${count.value}\`);
    };

    return () => h('div', { class: 'ds-card ds-p-6 ds-m-4' }, [
      h('div', { class: 'ds-text-center' }, [
        h('h1', { class: 'ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary' }, 
          \`🎉 Hello from ${name}!\`
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
});`;
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
        'vue': '^3.4.0'
      },
      devDependencies: {
        '@mfe-toolkit/build': 'workspace:*',
        'esbuild': '^0.24.2',
        'esbuild-plugin-vue3': '^0.4.2',
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
          'vue': '^3.4.0'
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
        displayName: `${name} MFE`,
        description: `Microfrontend built with Vue 3`,
        icon: '💚',
        author: { name: 'MFE Toolkit Team' },
        category: projectPath.includes('service-demos') ? 'service-demos' : 'custom',
        tags: ['vue3', 'mfe']
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
import vuePlugin from 'esbuild-plugin-vue3';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/${name}.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [vuePlugin()]
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
        resolveJsonModule: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
  }

  generateReadme(): string {
    const { name } = this.config;
    
    return `# ${name}

A simple Vue 3 microfrontend with a beautiful hello world interface.

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Build in watch mode
pnpm build:watch
\`\`\`
`;
  }
}