#!/usr/bin/env node

import { program } from 'commander';
import { createCommand } from './commands/create';
import { generateCommand } from './commands/generate';
import { validateCommand } from './commands/validate';

program
  .name('mfe-toolkit')
  .description('CLI for creating and managing microfrontends')
  .version('0.1.0');

program.addCommand(createCommand);
program.addCommand(generateCommand);
program.addCommand(validateCommand);

program.parse();
