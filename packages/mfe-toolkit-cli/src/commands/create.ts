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
      const answers = await prompts([
        {
          type: name ? null : 'text',
          name: 'name',
          message: 'What is the name of your microfrontend?',
          initial: name || 'my-mfe',
          validate: (value) => /^[a-z0-9-]+$/.test(value) || 'Name must be lowercase with hyphens only'
        },
        {
          type: options.template ? null : 'select',
          name: 'template',
          message: 'Which framework would you like to use?',
          choices: [
            { title: 'React', value: 'react' },
            { title: 'Vue 3', value: 'vue' },
            { title: 'Vanilla TypeScript', value: 'vanilla-ts' },
            { title: 'Vanilla JavaScript', value: 'vanilla-js' }
          ],
          initial: 0
        },
        {
          type: 'confirm',
          name: 'includeRouter',
          message: 'Include routing?',
          initial: true
        },
        {
          type: 'confirm',
          name: 'includeState',
          message: 'Include state management?',
          initial: true
        }
      ], {
        onCancel: () => {
          console.log(chalk.red('✖ Operation cancelled'));
          process.exit(1);
        }
      });

      const config = {
        name: answers.name || name,
        template: answers.template || options.template || 'react',
        includeRouter: answers.includeRouter ?? true,
        includeState: answers.includeState ?? true
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
  const packageJson = {
    name: `@mfe/${config.name}`,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      '@mfe-toolkit/core': '^0.1.0'
    },
    devDependencies: {
      vite: '^5.0.0',
      typescript: '^5.3.3'
    }
  };

  if (config.template === 'react') {
    packageJson.dependencies['react'] = '^18.2.0';
    packageJson.dependencies['react-dom'] = '^18.2.0';
    packageJson.dependencies['@mfe-toolkit/react'] = '^0.1.0';
    packageJson.devDependencies['@vitejs/plugin-react'] = '^4.2.0';
  }

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create basic entry file
  const entryContent = config.template === 'react' 
    ? `import React from 'react';
import ReactDOM from 'react-dom/client';
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const App: React.FC<{ services: MFEServices }> = ({ services }) => {
  return <div>Hello from ${config.name}!</div>;
};

const mfeModule: MFEModule = {
  mount: (element, services) => {
    const root = ReactDOM.createRoot(element);
    root.render(<App services={services} />);
    
    return () => {
      root.unmount();
    };
  }
};

export default mfeModule;`
    : `import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const mfeModule: MFEModule = {
  mount: (element, services) => {
    element.innerHTML = '<div>Hello from ${config.name}!</div>';
    
    return () => {
      element.innerHTML = '';
    };
  }
};

export default mfeModule;`;

  await fs.writeFile(
    path.join(projectPath, 'src', config.template === 'react' ? 'index.tsx' : 'index.ts'),
    entryContent
  );

  // Create manifest.json
  const manifest = {
    "$schema": "https://mfe-toolkit.com/schemas/mfe-manifest-v2.schema.json",
    name: config.name,
    version: "0.1.0",
    url: `http://localhost:8080/${config.name}/index.js`,
    dependencies: {
      runtime: {},
      peer: config.template === 'react' ? {
        react: "^18.0.0",
        "react-dom": "^18.0.0"
      } : {}
    },
    compatibility: {
      container: ">=0.1.0"
    },
    requirements: {
      services: [
        { name: "logger" },
        { name: "eventBus" }
      ]
    },
    metadata: {
      displayName: config.name,
      description: `${config.name} microfrontend`
    }
  };

  await fs.writeJson(path.join(projectPath, 'manifest.json'), manifest, { spaces: 2 });
}