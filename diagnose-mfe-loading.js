#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🔍 MFE Loading Diagnostics\n');

// Check if dist files exist
console.log('📁 Checking MFE build files:');
const mfeFiles = [
  'dist/mfe-state-demo-react/mfe-state-demo-react.js',
  'dist/mfe-state-demo-vue/mfe-state-demo-vue.js',
  'dist/mfe-state-demo-vanilla/main.js'
];

mfeFiles.forEach(file => {
  const path = join(__dirname, file);
  if (existsSync(path)) {
    const stats = readFileSync(path);
    console.log(`  ✅ ${file} (${(stats.length / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
  }
});

// Check if serve is running
console.log('\n🌐 Checking HTTP server on port 8080:');
const checkServer = () => {
  return new Promise((resolve) => {
    const req = createServer().request({
      hostname: 'localhost',
      port: 8080,
      path: '/mfe-state-demo-react/mfe-state-demo-react.js',
      method: 'GET'
    }, (res) => {
      console.log(`  ✅ Server is running (status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`  ❌ Server is not running: ${err.message}`);
      console.log('  💡 Run: pnpm serve');
      resolve(false);
    });
    
    req.end();
  });
};

// Check registry files
console.log('\n📋 Checking MFE registry:');
const registryPath = join(__dirname, 'apps/container/public/mfe-registry.json');
if (existsSync(registryPath)) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const stateMfes = registry.mfes.filter(mfe => 
    ['stateDemoReact', 'stateDemoVue', 'stateDemoVanilla'].includes(mfe.name)
  );
  
  stateMfes.forEach(mfe => {
    console.log(`  ✅ ${mfe.name}: ${mfe.url}`);
  });
  
  if (stateMfes.length < 3) {
    console.log('  ⚠️  Some state demo MFEs are missing from registry');
  }
} else {
  console.log('  ❌ Registry file not found');
}

// Test dynamic import
console.log('\n🧪 Testing dynamic imports:');
console.log('  Open test-mfe-loading.html in your browser to test MFE loading');
console.log('  File: file://' + join(__dirname, 'test-mfe-loading.html'));

// Instructions
console.log('\n📝 Troubleshooting steps:');
console.log('1. Make sure all services are running:');
console.log('   pnpm dev          # In one terminal');
console.log('   pnpm serve        # In another terminal');
console.log('');
console.log('2. Check browser console for errors');
console.log('3. Look for SafeMFELoader debug logs');
console.log('4. If no logs appear, restart the container app:');
console.log('   - Stop the dev server (Ctrl+C)');
console.log('   - Run: pnpm build:container');
console.log('   - Run: pnpm dev');

// Run checks
checkServer().then(() => {
  console.log('\n✨ Diagnostics complete');
});