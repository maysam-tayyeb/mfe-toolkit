#!/usr/bin/env tsx

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ManifestValidator } from '@mfe-toolkit/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const validator = new ManifestValidator();

console.log('🔍 Validating MFE manifests...\n');

// Find all MFE directories
const appsDir = join(__dirname, '../apps');
const mfeDirs = readdirSync(appsDir)
  .filter((dir) => dir.startsWith('mfe-'))
  .map((dir) => join(appsDir, dir));

let hasErrors = false;
const results: Array<{ mfe: string; valid: boolean; errors?: string[] }> = [];

for (const mfeDir of mfeDirs) {
  const mfeName = mfeDir.split('/').pop()!;
  const manifestPath = join(mfeDir, 'manifest.json');

  try {
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    const validation = validator.validate(manifest);

    if (validation.valid) {
      results.push({ mfe: mfeName, valid: true });
      console.log(`✅ ${mfeName}: Valid V${validation.version} manifest`);
    } else {
      hasErrors = true;
      results.push({ mfe: mfeName, valid: false, errors: validation.errors });
      console.log(`❌ ${mfeName}: Invalid manifest`);
      validation.errors.forEach((error) => console.log(`   - ${error}`));
    }
  } catch (error) {
    hasErrors = true;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    results.push({ mfe: mfeName, valid: false, errors: [errorMessage] });
    console.log(`❌ ${mfeName}: ${errorMessage}`);
  }
}

console.log('\n📊 Summary:');
console.log(`Total MFEs: ${results.length}`);
console.log(`Valid: ${results.filter((r) => r.valid).length}`);
console.log(`Invalid: ${results.filter((r) => !r.valid).length}`);

if (hasErrors) {
  console.log('\n❌ Manifest validation failed!');
  process.exit(1);
} else {
  console.log('\n✅ All manifests are valid!');
}
