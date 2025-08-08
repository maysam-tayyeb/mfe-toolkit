import { Command } from 'commander';
import { ManifestGenerator } from './manifest-generator';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Generate MFE artifacts')
  .command('manifest')
  .description('Generate a manifest file')
  .option('-n, --name <name>', 'MFE name')
  .option('-v, --version <version>', 'MFE version', '1.0.0')
  .option('-f, --framework <framework>', 'Framework (react, vue, vanilla)', 'react')
  .option('-t, --template <template>', 'Template to use', 'basic')
  .option('-o, --output <output>', 'Output file path', 'manifest.json')
  .action(async (options) => {
    try {
      const generator = new ManifestGenerator();
      const manifest = generator.generateManifest({
        name: options.name || path.basename(process.cwd()),
        version: options.version,
        framework: options.framework,
        template: options.template,
      });

      await fs.writeJson(options.output, manifest, { spaces: 2 });

      console.log(chalk.green(`✅ Manifest generated successfully at ${options.output}`));
      console.log(chalk.gray('\n📋 Generated manifest:'));
      console.log(JSON.stringify(manifest, null, 2));
    } catch (error) {
      console.error(chalk.red('✖ Error generating manifest:'), error);
      process.exit(1);
    }
  });
