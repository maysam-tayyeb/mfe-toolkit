#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ManifestValidator } from '@mfe/dev-kit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const validator = new ManifestValidator();

console.log('🏗️  Building MFE registry from individual manifests...\n');

// Find all MFE directories
const appsDir = join(__dirname, '../apps');
const mfeDirs = readdirSync(appsDir)
  .filter((dir) => dir.startsWith('mfe-'))
  .map((dir) => join(appsDir, dir));

const manifests: any[] = [];
let hasErrors = false;

for (const mfeDir of mfeDirs) {
  const mfeName = mfeDir.split('/').pop()!;
  const manifestPath = join(mfeDir, 'manifest.json');

  try {
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    const validation = validator.validate(manifest);

    if (validation.valid) {
      manifests.push(manifest);
      console.log(`✅ Added ${mfeName} (${manifest.name}) to registry`);
    } else {
      hasErrors = true;
      console.log(`❌ Skipped ${mfeName}: Invalid manifest`);
      validation.errors.forEach((error) => console.log(`   - ${error}`));
    }
  } catch (error) {
    console.log(
      `⚠️  Skipped ${mfeName}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

if (hasErrors) {
  console.log('\n❌ Some manifests were invalid. Fix them before building the registry.');
  process.exit(1);
}

// Build the registry
const registry = {
  $schema: 'https://mfe-made-easy.com/schemas/mfe-registry.schema.json',
  version: '2.0.0',
  environment: process.env.NODE_ENV || 'development',
  lastUpdated: new Date().toISOString(),
  mfes: manifests,
  config: {
    defaultLoading: {
      timeout: 30000,
      retries: 3,
    },
    features: {
      'typed-events': true,
      'error-boundaries': true,
      'manifest-v2': true,
    },
  },
};

// Write the registry
const outputPath = join(__dirname, '../apps/container/public/mfe-registry-v2-generated.json');
writeFileSync(outputPath, JSON.stringify(registry, null, 2));

console.log(`\n✅ Registry built successfully!`);
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Total MFEs: ${manifests.length}`);
