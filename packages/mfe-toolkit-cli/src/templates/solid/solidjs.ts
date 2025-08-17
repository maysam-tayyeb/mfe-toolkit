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
    const { name } = this.config;
    
    return `import { createSignal } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App = (props: AppProps) => {
  const [count, setCount] = createSignal(0);

  const handleClick = () => {
    setCount(count() + 1);
    props.services.logger?.info(\`Button clicked! Count: \${count()}\`);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔷 ${name}
        </h1>
        <p class="ds-text-gray-600 ds-mb-6">
          A Solid.js Micro Frontend
        </p>
        
        <div class="ds-space-y-4">
          <div class="ds-p-4 ds-bg-gray-50 ds-rounded-lg">
            <p class="ds-text-2xl ds-font-semibold">{count()}</p>
            <p class="ds-text-sm ds-text-gray-500">Click count</p>
          </div>
          
          <button
            onClick={handleClick}
            class="ds-btn-primary"
          >
            Click me!
          </button>
        </div>
        
        <p class="ds-text-sm ds-text-gray-500 ds-mt-6">
          Built with ❤️ using MFE Toolkit
        </p>
      </div>
    </div>
  );
};`;
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