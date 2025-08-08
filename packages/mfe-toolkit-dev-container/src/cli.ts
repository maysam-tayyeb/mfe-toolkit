#!/usr/bin/env node

/**
 * MFE Development Container CLI
 * Command-line interface for running MFEs with dev container
 */

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { DevContainerServer } from './server';

const program = new Command();

program.name('mfe-dev').description('Run MFE with development container').version('0.1.0');

program
  .command('start', { isDefault: true })
  .description('Start the MFE development container')
  .option('-p, --port <port>', 'Port to run on', '3333')
  .option('-c, --config <path>', 'Path to mfe.config.js', './mfe.config.js')
  .option('--no-services-ui', 'Disable services UI')
  .option('--no-hot', 'Disable hot reload')
  .option('--build', 'Build MFE before starting')
  .action(async (options) => {
    try {
      console.log(chalk.blue('\n🚀 Starting MFE Development Container...\n'));

      // Find and load MFE config
      const configPath = path.resolve(process.cwd(), options.config);

      if (!fs.existsSync(configPath)) {
        console.error(chalk.red(`❌ Config file not found: ${configPath}`));
        console.log(chalk.yellow('\nCreate an mfe.config.js file with:'));
        console.log(
          chalk.gray(`
module.exports = {
  name: 'My MFE',
  framework: 'react19',
  entry: './src/main.tsx',
  devContainer: {
    port: 3333,
    servicesUI: true,
    services: {
      modal: true,
      notification: true,
      eventBus: true,
      logger: true,
      auth: true,
      designSystem: true
    }
  }
};`)
        );
        process.exit(1);
      }

      // Load config
      const mfeConfig = require(configPath);
      const mfePath = path.dirname(configPath);

      console.log(chalk.gray(`Loading config from: ${configPath}`));
      console.log(chalk.gray(`MFE path: ${mfePath}\n`));

      // Build if requested
      if (options.build) {
        console.log(chalk.yellow('Building MFE...'));
        const { execSync } = require('child_process');
        try {
          execSync('npm run build', { cwd: mfePath, stdio: 'inherit' });
          console.log(chalk.green('✅ Build complete\n'));
        } catch (error) {
          console.error(chalk.red('❌ Build failed'));
          process.exit(1);
        }
      }

      // Check if dist exists
      const distPath = path.join(mfePath, 'dist');
      if (!fs.existsSync(distPath)) {
        console.warn(
          chalk.yellow('⚠️  No dist folder found. Run build first or use --build flag\n')
        );
      }

      // Create and start server
      const server = new DevContainerServer({
        port: parseInt(options.port),
        mfePath,
        mfeConfig,
        servicesUI: options.servicesUi !== false,
        hot: options.hot !== false,
      });

      await server.start();

      // Setup file watching for hot reload
      if (options.hot !== false) {
        const watcher = chokidar.watch([path.join(mfePath, 'src'), path.join(mfePath, 'dist')], {
          ignored: /node_modules/,
          persistent: true,
        });

        watcher.on('change', (filepath) => {
          console.log(chalk.gray(`File changed: ${path.relative(mfePath, filepath)}`));
          server.notifyReload();
        });
      }

      // Handle shutdown
      process.on('SIGINT', () => {
        console.log(chalk.yellow('\n\n👋 Shutting down dev container...'));
        server.stop();
        process.exit(0);
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to start dev container:'), error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize mfe.config.js in current directory')
  .option('-f, --framework <framework>', 'Framework (react19, react17, vue3, vanilla)', 'react19')
  .action((options) => {
    const configPath = path.join(process.cwd(), 'mfe.config.js');

    if (fs.existsSync(configPath)) {
      console.error(chalk.red('❌ mfe.config.js already exists'));
      process.exit(1);
    }

    const packageJson = path.join(process.cwd(), 'package.json');
    let name = 'my-mfe';
    let version = '1.0.0';

    if (fs.existsSync(packageJson)) {
      const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
      name = pkg.name || name;
      version = pkg.version || version;
    }

    const config = `/**
 * MFE Development Configuration
 * Used by @mfe-toolkit/dev-container
 */

module.exports = {
  name: '${name}',
  displayName: '${name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}',
  version: '${version}',
  framework: '${options.framework}',
  
  // Entry point for the MFE
  entry: './src/main.${options.framework.includes('react') ? 'tsx' : options.framework.includes('vue') ? 'js' : 'ts'}',
  
  // Dev container configuration
  devContainer: {
    port: 3333,
    servicesUI: true,
    
    // Mock auth configuration
    mockAuth: {
      isAuthenticated: true,
      user: {
        id: '123',
        name: 'Dev User',
        email: 'dev@example.com'
      },
      roles: ['user', 'admin'],
      permissions: ['read', 'write']
    },
    
    // Theme configuration
    theme: 'light',
    
    // Enable services
    services: {
      modal: true,
      notification: true,
      eventBus: true,
      logger: true,
      auth: true,
      theme: true,
      stateManager: true,
      designSystem: true
    },
    
    // Shared dependencies that should be provided by container
    sharedDependencies: {
      ${
        options.framework.includes('react')
          ? `'react': '^19.0.0',
      'react-dom': '^19.0.0',`
          : ''
      }
      ${options.framework.includes('vue') ? `'vue': '^3.0.0',` : ''}
      '@mfe/design-system': '*',
      '@mfe-toolkit/core': '*'
    },
    
    // Hot reload configuration
    hot: true,
    
    // Proxy configuration for API calls
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  
  // Build configuration
  build: {
    // External dependencies (not bundled)
    externals: [
      ${
        options.framework.includes('react')
          ? `'react',
      'react-dom',`
          : ''
      }
      ${options.framework.includes('vue') ? `'vue',` : ''}
      '@mfe/design-system'
    ],
    
    // Output configuration
    output: {
      format: 'esm',
      filename: '${name}.js'
    }
  }
};
`;

    fs.writeFileSync(configPath, config);
    console.log(chalk.green(`✅ Created mfe.config.js`));
    console.log(chalk.gray(`\nNext steps:`));
    console.log(chalk.cyan(`  1. Review and customize mfe.config.js`));
    console.log(chalk.cyan(`  2. Run: mfe-dev start`));
  });

program.parse(process.argv);
