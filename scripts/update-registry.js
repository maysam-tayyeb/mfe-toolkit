#!/usr/bin/env node

/**
 * Script to update MFE registry URLs for different environments
 * Usage: node scripts/update-registry.js --env production --base-url https://cdn.example.com
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const envIndex = args.indexOf('--env');
const urlIndex = args.indexOf('--base-url');

const environment = envIndex !== -1 ? args[envIndex + 1] : 'development';
const baseUrl = urlIndex !== -1 ? args[urlIndex + 1] : '';

const registryPath = path.join(__dirname, '../apps/container/public', `mfe-registry.${environment}.json`);

if (!fs.existsSync(registryPath)) {
  console.error(`Registry file not found: ${registryPath}`);
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

if (baseUrl) {
  // Update all MFE URLs with the new base URL
  registry.mfes = registry.mfes.map(mfe => ({
    ...mfe,
    url: `${baseUrl}/mfes/${mfe.name}/v${mfe.version}/${mfe.name === 'react17' ? 'react17-mfe' : 'mfe-' + mfe.name}.js`,
    metadata: {
      ...mfe.metadata,
      cdnUrl: `${baseUrl}/mfes/${mfe.name}/v${mfe.version}/`
    }
  }));
  
  registry.cdnBaseUrl = baseUrl;
}

registry.lastUpdated = new Date().toISOString();

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log(`✅ Updated registry for ${environment} environment`);
if (baseUrl) {
  console.log(`📍 Base URL set to: ${baseUrl}`);
}
console.log(`📄 File: ${registryPath}`);