#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

interface ServiceOptions {
  name: string;
  path?: string;
  description?: string;
}

/**
 * Convert service name to various formats
 */
function getServiceNames(name: string) {
  const kebabName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const camelName = kebabName.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1);
  
  return {
    kebab: kebabName,
    camel: camelName,
    pascal: pascalName,
    upper: kebabName.toUpperCase().replace(/-/g, '_')
  };
}

/**
 * Create service package files
 */
async function createServiceFiles(servicePath: string, options: ServiceOptions) {
  const names = getServiceNames(options.name);
  const packageName = `@mfe-toolkit/service-${names.kebab}`;
  
  // Create package.json
  const packageJson = {
    name: packageName,
    version: '1.0.0',
    description: options.description || `${names.pascal} service for MFE Toolkit`,
    type: 'module',
    main: './dist/index.cjs',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs'
      },
      './types': {
        types: './dist/types.d.ts'
      }
    },
    files: ['dist', 'README.md'],
    scripts: {
      build: 'tsup',
      'build:watch': 'tsup --watch',
      test: 'vitest',
      'test:watch': 'vitest --watch',
      'test:coverage': 'vitest --coverage',
      clean: 'rm -rf dist',
      lint: 'eslint src --fix',
      'type-check': 'tsc --noEmit'
    },
    peerDependencies: {
      '@mfe-toolkit/core': 'workspace:*'
    },
    devDependencies: {
      '@mfe-toolkit/core': 'workspace:*',
      '@types/node': '^20.11.5',
      tsup: '^8.0.1',
      typescript: '^5.3.3',
      vitest: '^1.2.1',
      '@vitest/coverage-v8': '^1.2.1'
    }
  };
  
  await fs.writeJson(path.join(servicePath, 'package.json'), packageJson, { spaces: 2 });
  
  // Create tsconfig.json
  const tsConfig = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src',
      composite: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
  };
  
  await fs.writeJson(path.join(servicePath, 'tsconfig.json'), tsConfig, { spaces: 2 });
  
  // Create tsup.config.ts
  const tsupConfig = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['@mfe-toolkit/core']
});`;
  
  await fs.writeFile(path.join(servicePath, 'tsup.config.ts'), tsupConfig);
  
  // Create vitest.config.ts
  const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});`;
  
  await fs.writeFile(path.join(servicePath, 'vitest.config.ts'), vitestConfig);
  
  // Create src/types.ts
  const typesContent = `/**
 * ${names.pascal} Service Interface
 */

export interface ${names.pascal}Service {
  /**
   * Example method - replace with actual service methods
   */
  execute(data: unknown): void;
  
  /**
   * Example async method
   */
  process(input: string): Promise<string>;
}

/**
 * Configuration options for ${names.pascal} service
 */
export interface ${names.pascal}Config {
  /**
   * Enable debug logging
   */
  debug?: boolean;
  
  /**
   * Additional configuration options
   */
  [key: string]: unknown;
}`;
  
  await fs.ensureDir(path.join(servicePath, 'src'));
  await fs.writeFile(path.join(servicePath, 'src', 'types.ts'), typesContent);
  
  // Create src/implementation.ts
  const implementationContent = `import type { ${names.pascal}Service, ${names.pascal}Config } from './types';
import type { Logger } from '@mfe-toolkit/core';

/**
 * Default implementation of ${names.pascal}Service
 */
export class ${names.pascal}ServiceImpl implements ${names.pascal}Service {
  private logger?: Logger;
  private config: ${names.pascal}Config;
  
  constructor(config: ${names.pascal}Config = {}, logger?: Logger) {
    this.config = config;
    this.logger = logger;
  }
  
  execute(data: unknown): void {
    if (this.config.debug) {
      this.logger?.debug('[${names.pascal}Service] Executing with data:', data);
    }
    // Implementation here
  }
  
  async process(input: string): Promise<string> {
    if (this.config.debug) {
      this.logger?.debug('[${names.pascal}Service] Processing:', input);
    }
    // Async implementation here
    return \`Processed: \${input}\`;
  }
}

/**
 * Factory function to create ${names.pascal}Service
 */
export function create${names.pascal}Service(
  config?: ${names.pascal}Config,
  logger?: Logger
): ${names.pascal}Service {
  return new ${names.pascal}ServiceImpl(config, logger);
}`;
  
  await fs.writeFile(path.join(servicePath, 'src', 'implementation.ts'), implementationContent);
  
  // Create src/provider.ts
  const providerContent = `import type { ServiceProvider, ServiceContainer } from '@mfe-toolkit/core';
import type { ${names.pascal}Service } from './types';
import { create${names.pascal}Service } from './implementation';

/**
 * Service provider for lazy initialization
 */
export const ${names.camel}ServiceProvider: ServiceProvider<${names.pascal}Service> = {
  name: '${names.camel}',
  version: '1.0.0',
  
  create(container: ServiceContainer): ${names.pascal}Service {
    const logger = container.get('logger');
    return create${names.pascal}Service({ debug: true }, logger);
  },
  
  dispose(): void {
    // Cleanup if needed
  }
};`;
  
  await fs.writeFile(path.join(servicePath, 'src', 'provider.ts'), providerContent);
  
  // Create src/index.ts with module augmentation
  const indexContent = `/**
 * ${names.pascal} Service Package
 * 
 * This package provides the ${names.pascal} service for MFE Toolkit.
 * It extends the ServiceMap interface via TypeScript module augmentation.
 */

import type { ${names.pascal}Service } from './types';

// Module augmentation to extend ServiceMap
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    ${names.camel}: ${names.pascal}Service;
  }
}

// Export types
export type { ${names.pascal}Service, ${names.pascal}Config } from './types';

// Export implementation (tree-shakable)
export { ${names.pascal}ServiceImpl, create${names.pascal}Service } from './implementation';

// Export provider
export { ${names.camel}ServiceProvider } from './provider';

// Export service key constant
export const ${names.upper}_SERVICE_KEY = '${names.camel}';`;
  
  await fs.writeFile(path.join(servicePath, 'src', 'index.ts'), indexContent);
  
  // Create src/__tests__/implementation.test.ts
  const testContent = `import { describe, it, expect, vi } from 'vitest';
import { ${names.pascal}ServiceImpl } from '../implementation';
import type { Logger } from '@mfe-toolkit/core';

describe('${names.pascal}ServiceImpl', () => {
  it('should create an instance', () => {
    const service = new ${names.pascal}ServiceImpl();
    expect(service).toBeDefined();
  });
  
  it('should execute method', () => {
    const mockLogger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };
    
    const service = new ${names.pascal}ServiceImpl({ debug: true }, mockLogger);
    service.execute('test data');
    
    expect(mockLogger.debug).toHaveBeenCalledWith(
      '[${names.pascal}Service] Executing with data:',
      'test data'
    );
  });
  
  it('should process input asynchronously', async () => {
    const service = new ${names.pascal}ServiceImpl();
    const result = await service.process('test input');
    
    expect(result).toBe('Processed: test input');
  });
});`;
  
  await fs.ensureDir(path.join(servicePath, 'src', '__tests__'));
  await fs.writeFile(path.join(servicePath, 'src', '__tests__', 'implementation.test.ts'), testContent);
  
  // Create README.md
  const readmeContent = `# ${packageName}

${options.description || `${names.pascal} service for MFE Toolkit`}

## Installation

\`\`\`bash
pnpm add ${packageName}
\`\`\`

## Usage

### In MFEs (Type-only import - zero runtime cost)

\`\`\`typescript
import type { ${names.pascal}Service } from '${packageName}';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    const ${names.camel} = container.get('${names.camel}');
    ${names.camel}.execute(data);
  },
  
  unmount: async () => {
    // Cleanup
  }
};

export default module;
\`\`\`

### In Container (Implementation import)

\`\`\`typescript
import { create${names.pascal}Service } from '${packageName}';

// Create and register the service
const ${names.camel}Service = create${names.pascal}Service({ debug: true });
container.register('${names.camel}', ${names.camel}Service);
\`\`\`

### With Service Provider (Lazy initialization)

\`\`\`typescript
import { ${names.camel}ServiceProvider } from '${packageName}';

registry.registerProvider(${names.camel}ServiceProvider);
\`\`\`

## API

### ${names.pascal}Service Interface

\`\`\`typescript
interface ${names.pascal}Service {
  execute(data: unknown): void;
  process(input: string): Promise<string>;
}
\`\`\`

### Configuration

\`\`\`typescript
interface ${names.pascal}Config {
  debug?: boolean;
  // Additional options
}
\`\`\`

## Module Augmentation

This package extends the \`ServiceMap\` interface from \`@mfe-toolkit/core\`:

\`\`\`typescript
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    ${names.camel}: ${names.pascal}Service;
  }
}
\`\`\`

## Development

\`\`\`bash
# Build the package
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm build:watch
pnpm test:watch
\`\`\`

## License

MIT`;
  
  await fs.writeFile(path.join(servicePath, 'README.md'), readmeContent);
}

/**
 * Create service command
 */
export const createServiceCommand = new Command('create-service')
  .description('Create a new service package')
  .argument('[name]', 'Service name (e.g., "notification", "analytics")')
  .option('-p, --path <path>', 'Path where service package will be created', './packages')
  .option('-d, --description <description>', 'Service description')
  .action(async (name?: string, options?: ServiceOptions) => {
    try {
      // Interactive prompts if name not provided
      if (!name) {
        const response = await prompts([
          {
            type: 'text',
            name: 'name',
            message: 'Service name (e.g., notification, analytics):',
            validate: (value: string) => value.length > 0 || 'Service name is required'
          },
          {
            type: 'text',
            name: 'description',
            message: 'Service description (optional):',
            initial: ''
          }
        ]);
        
        if (!response.name) {
          console.log(chalk.red('Service creation cancelled'));
          process.exit(1);
        }
        
        name = response.name;
        if (response.description) {
          options = { ...options, description: response.description, name };
        }
      }
      
      const names = getServiceNames(name);
      const packageName = `mfe-toolkit-service-${names.kebab}`;
      const servicePath = path.resolve(options?.path || './packages', packageName);
      
      // Check if package already exists
      if (await fs.pathExists(servicePath)) {
        console.log(chalk.red(`❌ Service package already exists at ${servicePath}`));
        process.exit(1);
      }
      
      console.log(chalk.blue(`\n📦 Creating service package: @mfe-toolkit/service-${names.kebab}\n`));
      
      // Create service files
      await createServiceFiles(servicePath, { ...options, name } as ServiceOptions);
      
      // Success message
      console.log(chalk.green(`\n✅ Service package created successfully!\n`));
      console.log(chalk.cyan('📁 Location:'), servicePath);
      console.log(chalk.cyan('📦 Package:'), `@mfe-toolkit/service-${names.kebab}`);
      
      console.log(chalk.yellow('\n📝 Next steps:'));
      console.log('  1. Review and update the service interface in src/types.ts');
      console.log('  2. Implement the service methods in src/implementation.ts');
      console.log('  3. Update tests in src/__tests__/');
      console.log('  4. Run pnpm install to link the workspace package');
      console.log('  5. Build the package: pnpm build');
      
      console.log(chalk.gray('\n💡 Tip: The service automatically extends ServiceMap via module augmentation'));
      
    } catch (error) {
      console.error(chalk.red('❌ Error creating service:'), error);
      process.exit(1);
    }
  });