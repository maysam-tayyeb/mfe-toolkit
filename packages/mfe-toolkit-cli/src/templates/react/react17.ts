import type { TemplateConfig, TemplateGenerator, ServiceConfig } from '../types';
import { getServiceConfig } from '../types';

export class React17Template implements TemplateGenerator {
  private config: TemplateConfig;
  private serviceConfig: ServiceConfig;

  constructor(config: TemplateConfig) {
    this.config = config;
    this.serviceConfig = getServiceConfig(config.serviceType || 'general', config.name);
  }

  generateMain(): string {
    const { name } = this.config;
    const { requiredServices, capabilities } = this.serviceConfig;

    return `import React from 'react';
import ReactDOM from 'react-dom';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let rootElement: HTMLElement | null = null;

const module: MFEModule = {
  metadata: {
    name: '${name}',
    version: '1.0.0',
    requiredServices: ${JSON.stringify(requiredServices)},
    capabilities: ${JSON.stringify(capabilities)}
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    rootElement = element;
    
    ReactDOM.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>,
      element
    );
    
    if (services.logger) {
      services.logger.info('[${name}] Mounted successfully with React 17');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (rootElement) {
      ReactDOM.unmountComponentAtNode(rootElement);
      rootElement = null;
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
    
    return `import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    services.logger?.info(\`Button clicked! Count: \${count + 1}\`);
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🎉 Hello from ${name}!
        </h1>
        <p className="ds-text-gray-600 ds-mb-6">
          React 17 MFE • Legacy Render API
        </p>
        
        <div className="ds-card-compact ds-inline-block ds-p-4">
          <div className="ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2">
            {count}
          </div>
          <button 
            onClick={handleClick}
            className="ds-btn-primary"
          >
            Click me!
          </button>
        </div>
        
        <p className="ds-text-sm ds-text-gray-500 ds-mt-6">
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
        dev: 'mfe-dev',
        build: 'node build.js',
        'build:watch': 'node build.js --watch',
        clean: 'rm -rf dist'
      },
      dependencies: {
        '@mfe-toolkit/core': 'workspace:*',
        'react': '^17.0.2',
        'react-dom': '^17.0.2'
      },
      devDependencies: {
        '@mfe-toolkit/build': 'workspace:*',
        '@mfe-toolkit/dev': 'workspace:*',
        '@types/react': '^17.0.2',
        '@types/react-dom': '^17.0.2',
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
      dependencies: {
        runtime: {
          'react': '^17.0.2 || ^18.0.0 || ^19.0.0',
          'react-dom': '^17.0.2 || ^18.0.0 || ^19.0.0'
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
          react: '^17.0.2 || ^18.0.0 || ^19.0.0'
        }
      },
      capabilities: {
        emits,
        listens,
        features: [...features, 'react17-hooks', 'legacy-support']
      },
      requirements: {
        services: requiredServices.map(name => ({ name, optional: name === 'logger' }))
      },
      metadata: {
        displayName: `${name} MFE`,
        description: `Microfrontend built with React 17`,
        icon: '🔗',
        author: { name: 'MFE Toolkit Team' },
        category: projectPath.includes('service-demos') ? 'service-demos' : 'custom',
        tags: ['react17', 'mfe']
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
  entry: 'src/main.tsx',
  outfile: 'dist/${name}.js',
  manifestPath: './manifest.json'
});`;
  }

  generateTsConfig(): object {
    return {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        jsx: 'react',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: false,
        noEmit: true,
        resolveJsonModule: true,
        types: ['react', 'react-dom']
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };
  }

  generateReadme(): string {
    const { name } = this.config;
    
    return `# ${name}

A simple React 17 microfrontend with a beautiful hello world interface.

## Development

### Standalone Development (Recommended)

\`\`\`bash
# Install dependencies
pnpm install

# Start standalone dev server with dev tools
pnpm dev

# Open http://localhost:3100
# Press Ctrl+Shift+D to toggle dev tools
\`\`\`

### Production Build

\`\`\`bash
# Build for production
pnpm build

# Build in watch mode
pnpm build:watch
\`\`\`
`;
  }

  generateMfeConfig(): string {
    return `// mfe.config.mjs
export default {
  dev: {
    // Load design system styles (adjust path as needed)
    styles: [
      '../../packages/design-system/dist/styles.css'
    ],
    
    // Configure viewport presets for testing
    viewport: {
      default: 'fullscreen',
      presets: []
    },
    
    // Configure themes
    themes: {
      default: 'light',
      themes: [
        {
          name: 'light',
          displayName: 'Light Theme',
          class: 'light'
        },
        {
          name: 'dark',
          displayName: 'Dark Theme',
          class: 'dark'
        }
      ]
    },
    
    // Show dev tools panel on startup
    showDevTools: true
  }
};
`;
  }
}