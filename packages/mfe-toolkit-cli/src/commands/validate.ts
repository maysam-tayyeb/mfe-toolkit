import { Command } from 'commander';
import { manifestValidator } from '@mfe-toolkit/core';
import chalk from 'chalk';
import fs from 'fs-extra';
import glob from 'glob';
import path from 'path';

export const validateCommand = new Command('validate')
  .description('Validate MFE manifests')
  .argument('[files...]', 'Manifest files to validate')
  .option('-p, --pattern <pattern>', 'Glob pattern to find manifests', '**/manifest.json')
  .action(async (files, options) => {
    try {
      // Find manifest files
      let manifestFiles: string[] = files;
      
      if (!manifestFiles.length) {
        manifestFiles = glob.sync(options.pattern, {
          ignore: ['**/node_modules/**', '**/dist/**']
        });
      }

      if (!manifestFiles.length) {
        console.log(chalk.yellow('⚠️  No manifest files found'));
        return;
      }

      console.log(chalk.blue(`\n🔍 Validating ${manifestFiles.length} manifest(s)...\n`));

      let hasErrors = false;
      
      for (const file of manifestFiles) {
        console.log(chalk.gray(`📄 ${file}`));
        
        try {
          const manifest = await fs.readJson(file);
          const result = manifestValidator.validate(manifest);
          
          if (result.valid) {
            console.log(chalk.green(`   ✅ Valid (v${result.version})`));
            
            if (result.warnings && result.warnings.length > 0) {
              console.log(chalk.yellow('   ⚠️  Warnings:'));
              result.warnings.forEach(warning => {
                console.log(chalk.yellow(`      - ${warning}`));
              });
            }
          } else {
            hasErrors = true;
            console.log(chalk.red('   ❌ Invalid'));
            
            if (result.errors && result.errors.length > 0) {
              console.log(chalk.red('   Errors:'));
              result.errors.forEach(error => {
                console.log(chalk.red(`      - ${error}`));
              });
            }
          }
        } catch (error) {
          hasErrors = true;
          console.log(chalk.red(`   ❌ Error reading file: ${error.message}`));
        }
        
        console.log('');
      }

      if (hasErrors) {
        console.log(chalk.red('✖ Validation failed with errors'));
        process.exit(1);
      } else {
        console.log(chalk.green('✅ All manifests are valid'));
      }
    } catch (error) {
      console.error(chalk.red('✖ Error validating manifests:'), error);
      process.exit(1);
    }
  });