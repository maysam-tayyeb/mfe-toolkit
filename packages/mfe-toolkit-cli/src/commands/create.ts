import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createCommand = new Command('create')
  .description('Create a new microfrontend')
  .argument('[name]', 'Name of the microfrontend')
  .option('-t, --template <template>', 'Template to use (react, vue, vanilla-js, vanilla-ts)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (name, options) => {
    try {
      // Prompt for missing information
      const answers = await prompts(
        [
          {
            type: name ? null : 'text',
            name: 'name',
            message: 'What is the name of your microfrontend?',
            initial: name || 'my-mfe',
            validate: (value) =>
              /^[a-z0-9-]+$/.test(value) || 'Name must be lowercase with hyphens only',
          },
          {
            type: options.template ? null : 'select',
            name: 'template',
            message: 'Which framework would you like to use?',
            choices: [
              { title: 'React', value: 'react' },
              { title: 'Vue 3', value: 'vue' },
              { title: 'Solid.js', value: 'solid' },
              { title: 'Vanilla TypeScript', value: 'vanilla-ts' },
              { title: 'Vanilla JavaScript', value: 'vanilla-js' },
            ],
            initial: 0,
          },
          {
            type: (prev) => prev === 'react' ? 'select' : null,
            name: 'reactVersion',
            message: 'Which React version would you like to use?',
            choices: [
              { title: 'React 19 (Latest)', value: '19' },
              { title: 'React 18 (Stable)', value: '18' },
              { title: 'React 17 (Legacy)', value: '17' },
            ],
            initial: 1,
          },
          {
            type: 'confirm',
            name: 'includeRouter',
            message: 'Include routing?',
            initial: true,
          },
          {
            type: 'confirm',
            name: 'includeState',
            message: 'Include state management?',
            initial: true,
          },
        ],
        {
          onCancel: () => {
            console.log(chalk.red('✖ Operation cancelled'));
            process.exit(1);
          },
        }
      );

      const config = {
        name: answers.name || name,
        template: answers.template || options.template || 'react',
        reactVersion: answers.reactVersion || '18',
        includeRouter: answers.includeRouter ?? true,
        includeState: answers.includeState ?? true,
      };

      console.log(chalk.blue('\n📦 Creating microfrontend...'));

      // Create project directory
      const projectPath = path.join(process.cwd(), config.name);
      await fs.ensureDir(projectPath);

      // Copy template files
      const templatePath = path.join(__dirname, '../../templates', config.template);
      if (await fs.pathExists(templatePath)) {
        await fs.copy(templatePath, projectPath);
      } else {
        // Create basic structure if template doesn't exist
        await createBasicStructure(projectPath, config);
      }

      // Update package.json with project name
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = `@mfe/${config.name}`;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      }

      console.log(chalk.green('\n✅ Microfrontend created successfully!'));
      console.log(chalk.gray(`\n📁 Location: ${projectPath}`));
      console.log(chalk.cyan('\n🚀 Next steps:'));
      console.log(chalk.gray(`   cd ${config.name}`));
      console.log(chalk.gray('   npm install'));
      console.log(chalk.gray('   npm run dev'));
    } catch (error) {
      console.error(chalk.red('✖ Error creating microfrontend:'), error);
      process.exit(1);
    }
  });

async function createBasicStructure(projectPath: string, config: any) {
  // Create basic directory structure
  await fs.ensureDir(path.join(projectPath, 'src'));

  // Create package.json
  const packageJson: {
    name: string;
    version: string;
    private: boolean;
    type: string;
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } = {
    name: config.name,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      build: 'node build.js',
      'build:watch': 'node build.js --watch',
    },
    dependencies: {},
    devDependencies: {
      '@mfe-toolkit/build': 'workspace:*',
      '@mfe-toolkit/core': 'workspace:*',
      'esbuild': '^0.19.11',
    },
  };

  if (config.template === 'react') {
    const reactVersion = config.reactVersion || '18';
    packageJson.dependencies['react'] = `^${reactVersion}.0.0`;
    packageJson.dependencies['react-dom'] = `^${reactVersion}.0.0`;
    packageJson.devDependencies['@types/react'] = '^18.2.0';
    packageJson.devDependencies['@types/react-dom'] = '^18.2.0';
    packageJson.devDependencies['typescript'] = '^5.3.0';
  } else if (config.template === 'vue') {
    packageJson.dependencies['vue'] = '^3.4.0';
    packageJson.devDependencies['@vitejs/plugin-vue'] = '^5.0.0';
    packageJson.devDependencies['esbuild-plugin-vue3'] = '^0.4.2';
    packageJson.devDependencies['typescript'] = '^5.3.0';
  } else if (config.template === 'solid') {
    packageJson.dependencies['solid-js'] = '^1.8.0';
    packageJson.devDependencies['esbuild-plugin-solid'] = '^0.5.0';
    packageJson.devDependencies['typescript'] = '^5.3.0';
  } else if (config.template === 'vanilla-ts') {
    packageJson.devDependencies['typescript'] = '^5.3.0';
  }

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create basic entry file based on template
  let entryContent = '';
  let entryFileName = 'main.ts';
  
  if (config.template === 'react') {
    const reactVersion = config.reactVersion || '18';
    const importStatement = reactVersion === '17' 
      ? `import ReactDOM from 'react-dom';`
      : `import ReactDOM from 'react-dom/client';`;
    
    entryFileName = 'main.tsx';
    entryContent = `import React from 'react';
${importStatement}
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let root: ${reactVersion === '17' ? 'HTMLElement | null' : 'ReactDOM.Root | null'} = null;

const module: MFEModule = {
  metadata: {
    name: '${config.name}',
    version: '1.0.0',
    requiredServices: ['logger'],
    capabilities: ['demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    ${reactVersion === '17' 
      ? `root = element;
    ReactDOM.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>,
      element
    );`
      : `root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );`}
    
    if (services.logger) {
      services.logger.info('[${config.name}] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (root) {
      ${reactVersion === '17' 
        ? `ReactDOM.unmountComponentAtNode(root);`
        : `root.unmount();`}
      root = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${config.name}] Unmounted successfully');
    }
  }
};

export default module;`;
  } else if (config.template === 'vue') {
    entryContent = `import { createApp } from 'vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import App from './App.vue';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: '${config.name}',
    version: '1.0.0',
    requiredServices: ['logger'],
    capabilities: ['demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    app = createApp(App, { services });
    app.mount(element);
    
    if (services.logger) {
      services.logger.info('[${config.name}] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${config.name}] Unmounted successfully');
    }
  }
};

export default module;`;
  } else if (config.template === 'solid') {
    entryFileName = 'main.tsx';
    entryContent = `import { render } from 'solid-js/web';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let cleanup: (() => void) | null = null;

const module: MFEModule = {
  metadata: {
    name: '${config.name}',
    version: '1.0.0',
    requiredServices: ['logger'],
    capabilities: ['demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    cleanup = render(() => <App services={services} />, element);
    
    if (services.logger) {
      services.logger.info('[${config.name}] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${config.name}] Unmounted successfully');
    }
  }
};

export default module;`;
  } else {
    entryContent = `import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  metadata: {
    name: '${config.name}',
    version: '1.0.0',
    requiredServices: ['logger'],
    capabilities: ['demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    element.innerHTML = '<div>Hello from ${config.name}!</div>';
    
    if (services.logger) {
      services.logger.info('[${config.name}] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${config.name}] Unmounted successfully');
    }
  }
};

export default module;`;
  }

  await fs.writeFile(
    path.join(projectPath, 'src', entryFileName),
    entryContent
  );

  // Create App component based on template
  if (config.template === 'react') {
    const appContent = `import React from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const handleNotification = () => {
    services.notification?.show({
      title: 'Hello from ${config.name}',
      message: 'This is a notification from the MFE',
      type: 'success'
    });
  };

  return (
    <div className="ds-p-4">
      <h2 className="ds-text-2xl ds-font-bold ds-mb-4">
        ${config.name} MFE
      </h2>
      <p className="ds-text-gray-600 ds-mb-4">
        This MFE was created with mfe-toolkit-cli
      </p>
      <button 
        onClick={handleNotification}
        className="ds-btn-primary"
      >
        Show Notification
      </button>
    </div>
  );
};`;
    await fs.writeFile(path.join(projectPath, 'src', 'App.tsx'), appContent);
  } else if (config.template === 'vue') {
    const appContent = `<template>
  <div class="ds-p-4">
    <h2 class="ds-text-2xl ds-font-bold ds-mb-4">
      ${config.name} MFE
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
    title: 'Hello from ${config.name}',
    message: 'This is a notification from the Vue MFE',
    type: 'success'
  });
};
</script>`;
    await fs.writeFile(path.join(projectPath, 'src', 'App.vue'), appContent);
  } else if (config.template === 'solid') {
    const appContent = `import { Component } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: Component<AppProps> = (props) => {
  const handleNotification = () => {
    props.services.notification?.show({
      title: 'Hello from ${config.name}',
      message: 'This is a notification from the Solid.js MFE',
      type: 'success'
    });
  };

  return (
    <div class="ds-p-4">
      <h2 class="ds-text-2xl ds-font-bold ds-mb-4">
        ${config.name} MFE
      </h2>
      <p class="ds-text-gray-600 ds-mb-4">
        This MFE was created with mfe-toolkit-cli
      </p>
      <button 
        onClick={handleNotification}
        class="ds-btn-primary"
      >
        Show Notification
      </button>
    </div>
  );
};`;
    await fs.writeFile(path.join(projectPath, 'src', 'App.tsx'), appContent);
  }

  // Create manifest.json with proper version specification
  const getRuntimeDeps = () => {
    if (config.template === 'react') {
      const version = config.reactVersion || '18';
      return {
        react: `^${version}.0.0`,
        'react-dom': `^${version}.0.0`,
      };
    } else if (config.template === 'vue') {
      return { vue: '^3.4.0' };
    } else if (config.template === 'solid') {
      return { 'solid-js': '^1.8.0' };
    }
    return {};
  };

  const manifest = {
    $schema: 'https://mfe-toolkit.com/schemas/mfe-manifest-v2.schema.json',
    name: config.name,
    version: '0.1.0',
    url: `http://localhost:8080/${config.name}/${config.name}.js`,
    dependencies: {
      runtime: getRuntimeDeps(),
      peer: {
        '@mfe-toolkit/core': '^0.1.0',
      },
    },
    compatibility: {
      container: '>=0.1.0',
      browsers: {
        chrome: '>=90',
        firefox: '>=88',
        safari: '>=14',
        edge: '>=90',
      },
    },
    requirements: {
      services: [
        { name: 'logger', optional: true },
        { name: 'eventBus', optional: false },
        { name: 'notification', optional: true },
      ],
    },
    metadata: {
      displayName: config.name,
      description: `${config.name} microfrontend`,
      icon: '📦',
      category: 'custom',
      tags: [config.template, 'mfe'],
    },
  };

  await fs.writeJson(path.join(projectPath, 'manifest.json'), manifest, { spaces: 2 });

  // Create build.js using the new buildMFE utility
  const buildContent = `import { buildMFE } from '@mfe-toolkit/build';
${config.template === 'vue' ? `import vuePlugin from 'esbuild-plugin-vue3';` : ''}
${config.template === 'solid' ? `import { solidPlugin } from 'esbuild-plugin-solid';` : ''}

// Build configuration using the new versioning system
// Automatically detects library versions from manifest.json
await buildMFE({
  entry: 'src/${entryFileName}',
  outfile: 'dist/${config.name}.js',
  manifestPath: './manifest.json'${config.template === 'vue' ? `,
  esbuildOptions: {
    plugins: [vuePlugin()]
  }` : ''}${config.template === 'solid' ? `,
  esbuildOptions: {
    plugins: [solidPlugin()]
  }` : ''}
});
`;

  await fs.writeFile(path.join(projectPath, 'build.js'), buildContent);

  // Update package.json scripts to use build.js
  const pkgJsonPath = path.join(projectPath, 'package.json');
  const pkgJson = await fs.readJson(pkgJsonPath);
  pkgJson.scripts.build = 'node build.js';
  pkgJson.scripts['build:watch'] = 'node build.js --watch';
  await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });

  // Create tsconfig.json for TypeScript projects
  if (config.template !== 'vanilla-js') {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        jsx: config.template === 'react' ? 'react-jsx' : 'preserve',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: false,
        noEmit: true,
        resolveJsonModule: true,
        types: config.template === 'react' ? ['react', 'react-dom'] : [],
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };

    await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  }

  // Create .gitignore
  const gitignoreContent = `node_modules
dist
*.log
.DS_Store
.env
.env.local
`;
  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);

  // Create README.md
  const readmeContent = `# ${config.name}

## Description
${config.name} microfrontend built with ${config.template}${config.template === 'react' ? ` (React ${config.reactVersion})` : ''}.

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Start development build (watch mode)
pnpm dev

# Build for production
pnpm build

# Clean build artifacts
pnpm clean
\`\`\`

## Library Versioning
This MFE uses the automatic library versioning system. The build process will:
1. Read the \`manifest.json\` to detect library versions
2. Apply the appropriate import aliasing at build time
3. Output code that uses versioned imports (e.g., \`react@${config.reactVersion || '18'}\`)

## Configuration
- **manifest.json**: Defines MFE metadata and dependencies
- **build.js**: Build configuration using \`@mfe-toolkit/build\`
- **tsconfig.json**: TypeScript configuration

## Integration
This MFE is designed to be loaded by the MFE container application.
The container provides shared dependencies via import maps.
`;
  await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
}
