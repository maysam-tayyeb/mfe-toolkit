#!/usr/bin/env node

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { MFEManifest, manifestValidator } from '@mfe-toolkit/core';

interface GeneratorOptions {
  name: string;
  version?: string;
  framework?: 'react' | 'vue' | 'solid' | 'vanilla';
  output?: string;
  template?: 'basic' | 'full';
}

export class ManifestGenerator {
  generateManifest(options: GeneratorOptions): MFEManifest {
    const { name, version = '1.0.0', framework = 'react', template = 'basic' } = options;

    const baseManifest: MFEManifest = {
      $schema: 'https://mfe-made-easy.com/schemas/mfe-manifest.schema.json',
      name,
      version,
      url: `http://localhost:8080/${name}/${name}.js`,
      dependencies: {
        runtime: {},
        peer: {},
      },
      compatibility: {
        container: '>=1.0.0',
      },
      requirements: {
        services: [
          { name: 'logger', optional: false },
          { name: 'eventBus', optional: false },
        ],
      },
      metadata: {
        displayName: this.formatDisplayName(name),
        description: `${this.formatDisplayName(name)} micro frontend`,
      },
    };

    // Add framework-specific dependencies
    switch (framework) {
      case 'react':
        baseManifest.dependencies.peer = {
          react: '^18.0.0 || ^19.0.0',
          'react-dom': '^18.0.0 || ^19.0.0',
        };
        baseManifest.compatibility.frameworks = {
          react: '>=18.0.0',
        };
        baseManifest.metadata.icon = '⚛️';
        break;

      case 'vue':
        baseManifest.dependencies.peer = {
          vue: '^3.4.0',
        };
        baseManifest.compatibility.frameworks = {
          vue: '>=3.4.0',
        };
        baseManifest.metadata.icon = '💚';
        break;

      case 'solid':
        baseManifest.dependencies.peer = {
          'solid-js': '^1.8.0',
        };
        baseManifest.compatibility.frameworks = {
          solid: '>=1.8.0',
        };
        baseManifest.metadata.icon = '🔷';
        break;

      case 'vanilla':
        baseManifest.metadata.icon = '🟨';
        break;
    }

    // Add more details for full template
    if (template === 'full') {
      baseManifest.alternativeUrls = [`https://cdn.example.com/${name}/${version}/${name}.js`];

      baseManifest.capabilities = {
        emits: [`${name}:loaded`, `${name}:error`],
        listens: ['app:theme-change', 'user:login', 'user:logout'],
        routes: [
          { path: `/${name}`, exact: true },
          { path: `/${name}/*`, exact: false },
        ],
        features: ['responsive', 'a11y', 'i18n'],
      };

      baseManifest.requirements.services.push(
        { name: 'auth', optional: true },
        { name: 'modal', optional: true },
        { name: 'notification', optional: true }
      );

      baseManifest.requirements.permissions = ['read:public'];

      baseManifest.metadata.author = {
        name: 'Your Name',
        email: 'your.email@example.com',
      };
      baseManifest.metadata.repository = `https://github.com/yourorg/${name}`;
      baseManifest.metadata.documentation = `https://docs.example.com/${name}`;
      baseManifest.metadata.tags = [framework, 'mfe'];

      baseManifest.config = {
        loading: {
          timeout: 30000,
          retries: 3,
          retryDelay: 1000,
          priority: 10,
          lazy: true,
        },
        runtime: {
          isolation: 'none',
          keepAlive: false,
          singleton: true,
        },
        communication: {
          eventNamespace: name,
        },
      };

      baseManifest.security = {
        csp: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'connect-src': ["'self'", 'https://api.example.com'],
        },
        permissions: {
          required: ['core:access'],
        },
      };

      baseManifest.lifecycle = {
        healthCheck: {
          url: `/${name}/health`,
          interval: 60000,
          timeout: 5000,
        },
      };
    }

    return baseManifest;
  }

  private formatDisplayName(name: string): string {
    return name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async run() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
      this.showHelp();
      return;
    }

    const options: GeneratorOptions = {
      name: '',
    };

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      switch (arg) {
        case '--name':
        case '-n':
          options.name = nextArg;
          i++;
          break;

        case '--version':
        case '-v':
          options.version = nextArg;
          i++;
          break;

        case '--framework':
        case '-f':
          options.framework = nextArg as any;
          i++;
          break;

        case '--output':
        case '-o':
          options.output = nextArg;
          i++;
          break;

        case '--template':
        case '-t':
          options.template = nextArg as any;
          i++;
          break;



        case '--validate':
          this.validateManifest(nextArg);
          return;
      }
    }


    // Validate required options
    if (!options.name) {
      console.error('Error: --name is required');
      this.showHelp();
      process.exit(1);
    }

    // Generate manifest
    const manifest = this.generateManifest(options);

    // Validate generated manifest
    const validation = manifestValidator.validate(manifest);
    if (!validation.valid) {
      console.error('Error: Generated manifest is invalid');
      console.error(manifestValidator.getSummary(validation));
      process.exit(1);
    }

    // Output manifest
    const outputPath = options.output || `${options.name}.manifest.json`;
    const jsonOutput = JSON.stringify(manifest, null, 2);

    if (outputPath === '-') {
      console.log(jsonOutput);
    } else {
      writeFileSync(outputPath, jsonOutput);
      console.log(`✅ Manifest generated successfully: ${outputPath}`);

      if (validation.warnings && validation.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        validation.warnings.forEach((w) => {
          console.log(`  - ${w.field}: ${w.message}`);
        });
      }
    }
  }

  private showHelp() {
    console.log(`
MFE Manifest Generator

Usage: mfe-manifest [options]

Options:
  -n, --name <name>           MFE name (required)
  -v, --version <version>     MFE version (default: 1.0.0)
  -f, --framework <framework> Framework: react, vue, solid, vanilla (default: react)
  -t, --template <template>   Template: basic, full (default: basic)
  -o, --output <path>         Output file path (default: <name>.manifest.json)
  --validate <path>           Validate an existing manifest
  -h, --help                  Show this help message

Examples:
  # Generate a basic React MFE manifest
  mfe-manifest --name my-app

  # Generate a full Vue MFE manifest
  mfe-manifest --name dashboard --framework vue --template full

  # Output to stdout
  mfe-manifest --name test-app --output -

  # Validate manifest
  mfe-manifest --validate my-app.manifest.json
`);
  }


  private validateManifest(path: string) {
    if (!path) {
      console.error('Error: Path to manifest file is required');
      process.exit(1);
    }

    if (!existsSync(path)) {
      console.error(`Error: File not found: ${path}`);
      process.exit(1);
    }

    try {
      const content = readFileSync(path, 'utf-8');
      const manifest = JSON.parse(content);

      const validation = manifestValidator.validate(manifest);
      console.log(manifestValidator.getSummary(validation));

      process.exit(validation.valid ? 0 : 1);
    } catch (error) {
      console.error(`Error reading or parsing manifest: ${error}`);
      process.exit(1);
    }
  }

}
