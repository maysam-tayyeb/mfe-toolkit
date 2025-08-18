#!/usr/bin/env node
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import pc from 'picocolors';
import { startDevServer } from './server.js';

async function main() {
  const cwd = process.cwd();
  
  console.log(pc.cyan('\n🚀 MFE Development Server\n'));
  
  // Check if MFE is built
  const distPath = resolve(cwd, 'dist');
  const packageJsonPath = resolve(cwd, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    console.error(pc.red('Error: No package.json found in current directory'));
    process.exit(1);
  }
  
  // Build the MFE if dist doesn't exist
  if (!existsSync(distPath)) {
    console.log(pc.yellow('Building MFE...'));
    const build = spawn('npm', ['run', 'build'], { 
      stdio: 'inherit',
      shell: true,
      cwd 
    });
    
    await new Promise((resolve, reject) => {
      build.on('close', (code) => {
        if (code === 0) resolve(undefined);
        else reject(new Error(`Build failed with code ${code}`));
      });
    });
  }
  
  // Start the dev server
  await startDevServer({ cwd });
}

main().catch((error) => {
  console.error(pc.red('Failed to start dev server:'), error);
  process.exit(1);
});