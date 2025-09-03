#!/usr/bin/env node

import { program } from 'commander';
import { createCommand } from './commands/create';
import { validateCommand } from './commands/validate';
import { registryCommand } from './commands/registry';
import { createServiceCommand } from './commands/create-service';

program
  .name('mfe-toolkit')
  .description('CLI for creating and managing microfrontends')
  .version('0.1.0');

program.addCommand(createCommand);
program.addCommand(validateCommand);
program.addCommand(registryCommand);
program.addCommand(createServiceCommand);

program.parse();
