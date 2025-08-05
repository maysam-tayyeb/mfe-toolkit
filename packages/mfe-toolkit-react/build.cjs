#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Clean dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Run TypeScript compiler
console.log('Building TypeScript...');
execSync('npx tsc', { stdio: 'inherit' });

// Move files from nested structure to flat structure
const srcDir = path.join('dist', 'mfe-toolkit-react', 'src');
if (fs.existsSync(srcDir)) {
  console.log('Fixing dist structure...');
  
  // Copy all files from nested src to dist root
  const files = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const file of files) {
    const srcPath = path.join(srcDir, file.name);
    const destPath = path.join('dist', file.name);
    
    if (file.isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  
  // Remove the nested directories
  fs.rmSync(path.join('dist', 'mfe-toolkit-react'), { recursive: true, force: true });
  fs.rmSync(path.join('dist', 'mfe-toolkit-core'), { recursive: true, force: true });
}

console.log('Build complete!');