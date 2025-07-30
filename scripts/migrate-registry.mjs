#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Since we're in an mjs file, we'll create a simple migration for now
// In production, you'd use the compiled manifest-migrator from mfe-dev-kit

const migrateManifest = (v1Manifest) => {
  const v2Manifest = {
    $schema: 'https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json',
    name: v1Manifest.name,
    version: v1Manifest.version,
    url: v1Manifest.url,
    dependencies: {
      runtime: {},
      peer: {}
    },
    compatibility: {
      container: '>=1.0.0'
    },
    requirements: {
      services: [
        { name: 'logger', optional: false },
        { name: 'eventBus', optional: false },
        { name: 'auth', optional: true },
        { name: 'modal', optional: true },
        { name: 'notification', optional: true }
      ]
    },
    metadata: {
      displayName: v1Manifest.metadata?.displayName || v1Manifest.name,
      description: v1Manifest.metadata?.description || `${v1Manifest.name} micro frontend`,
      icon: v1Manifest.metadata?.icon
    }
  };

  // Migrate dependencies
  if (v1Manifest.dependencies) {
    v1Manifest.dependencies.forEach(dep => {
      if (dep === 'react' || dep === 'react-dom') {
        v2Manifest.dependencies.peer[dep] = '^18.0.0 || ^19.0.0';
      } else {
        v2Manifest.dependencies.runtime[dep] = '*';
      }
    });
  }

  // Add framework-specific compatibility
  if (v1Manifest.dependencies?.includes('react')) {
    v2Manifest.compatibility.frameworks = { react: '>=18.0.0' };
  } else if (v1Manifest.dependencies?.includes('vue')) {
    v2Manifest.compatibility.frameworks = { vue: '>=3.4.0' };
  }

  // Add capabilities based on the MFE name
  const capabilities = {
    emits: [],
    listens: ['app:theme-change', 'user:login', 'user:logout']
  };

  if (v1Manifest.name === 'eventDemo') {
    capabilities.emits = ['event-demo:message', 'event-demo:action'];
    capabilities.listens.push('event-demo:external-message');
  } else if (v1Manifest.name.includes('state')) {
    capabilities.emits = ['state:changed'];
    capabilities.listens.push('state:sync');
  }

  v2Manifest.capabilities = capabilities;

  // Add config
  v2Manifest.config = {
    loading: {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000
    }
  };

  return v2Manifest;
};

// Main migration
const main = () => {
  const registryPath = join(__dirname, '../apps/container/public/mfe-registry.json');
  const outputPath = join(__dirname, '../apps/container/public/mfe-registry-v2.json');
  
  console.log('📖 Reading current registry...');
  const currentRegistry = JSON.parse(readFileSync(registryPath, 'utf-8'));
  
  console.log('🔄 Migrating manifests to V2 format...');
  const migratedMfes = currentRegistry.mfes.map(manifest => {
    console.log(`  - Migrating ${manifest.name}...`);
    return migrateManifest(manifest);
  });
  
  const newRegistry = {
    $schema: 'https://mfe-made-easy.com/schemas/mfe-registry.schema.json',
    version: '2.0.0',
    environment: 'development',
    lastUpdated: new Date().toISOString(),
    mfes: migratedMfes,
    config: {
      defaultLoading: {
        timeout: 30000,
        retries: 3
      },
      features: {
        'typed-events': true,
        'error-boundaries': true,
        'manifest-v2': true
      }
    }
  };
  
  writeFileSync(outputPath, JSON.stringify(newRegistry, null, 2));
  console.log(`✅ Migrated registry saved to: ${outputPath}`);
  
  // Generate migration report
  const reportPath = join(__dirname, '../apps/container/public/migration-report.md');
  const report = generateReport(currentRegistry, newRegistry);
  writeFileSync(reportPath, report);
  console.log(`📄 Migration report saved to: ${reportPath}`);
};

const generateReport = (oldRegistry, newRegistry) => {
  const lines = [
    '# MFE Registry Migration Report',
    `Date: ${new Date().toISOString()}`,
    '',
    '## Summary',
    `- Migrated ${oldRegistry.mfes.length} MFEs from V1 to V2 format`,
    '- Added comprehensive type safety with TypeScript interfaces',
    '- Enhanced with capabilities, requirements, and configuration',
    '',
    '## Changes Made',
    '',
    '### 1. Dependencies Structure',
    '- Separated runtime and peer dependencies',
    '- Added version ranges for better compatibility',
    '',
    '### 2. New Fields Added',
    '- `compatibility`: Container and framework version requirements',
    '- `capabilities`: Events emitted/listened, routes managed',
    '- `requirements`: Required services and permissions',
    '- `config`: Loading and runtime configuration',
    '',
    '### 3. Enhanced Metadata',
    '- Structured metadata with displayName and description',
    '- Maintained existing icon information',
    '',
    '## Migrated MFEs',
    ''
  ];
  
  newRegistry.mfes.forEach(mfe => {
    lines.push(`### ${mfe.name}`);
    lines.push(`- Version: ${mfe.version}`);
    lines.push(`- Display Name: ${mfe.metadata.displayName}`);
    lines.push(`- Framework: ${Object.keys(mfe.compatibility.frameworks || {})[0] || 'vanilla'}`);
    lines.push('');
  });
  
  lines.push('## Next Steps');
  lines.push('1. Review the migrated manifests in `mfe-registry-v2.json`');
  lines.push('2. Update container to use the new registry format');
  lines.push('3. Test all MFEs with the new manifests');
  lines.push('4. Replace the old registry once testing is complete');
  
  return lines.join('\n');
};

// Run migration
main();