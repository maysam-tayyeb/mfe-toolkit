#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

interface Manifest {
  dependencies?: {
    runtime?: Record<string, string>;
    peer?: Record<string, string>;
  };
}

interface ImportMapData {
  imports: Record<string, string>;
  generated: string;
  mfeCount: number;
}

async function generateImportMap(): Promise<ImportMapData> {
  console.log('📦 Generating import map from MFE manifests...');
  
  const imports: Record<string, string> = {};
  const versions = new Map<string, string>(); // Track highest version for each library
  let mfeCount = 0;
  
  // Read the registry
  const registryPath = path.join(rootDir, 'apps/container-react/public/mfe-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  
  // The registry already contains full manifests!
  for (const manifest of registry.mfes) {
    if (!manifest.name) {
      console.warn('⚠️  Skipping MFE without name');
      continue;
    }
    
    console.log(`  📋 Processing ${manifest.name}...`);
    mfeCount++;
    
    // Collect dependencies
    const deps = {
      ...manifest.dependencies?.runtime,
      ...manifest.dependencies?.peer,
    };
    
    for (const [lib, versionSpec] of Object.entries(deps || {})) {
      // Extract major version
      const majorVersion = versionSpec.match(/\d+/)?.[0];
      if (!majorVersion) continue;
      
      // Add versioned import (e.g., react@18)
      const versionedKey = `${lib}@${majorVersion}`;
      if (!imports[versionedKey]) {
        imports[versionedKey] = `https://esm.sh/${lib}@${majorVersion}`;
        console.log(`  ✅ Added ${versionedKey}`);
      }
      
      // Track highest version for non-versioned imports (for container)
      const currentVersion = versions.get(lib);
      if (!currentVersion || parseInt(majorVersion) > parseInt(currentVersion)) {
        versions.set(lib, majorVersion);
      }
    }
  }
  
  // Add non-versioned imports for container (using highest versions)
  for (const [lib, version] of versions) {
    imports[lib] = `https://esm.sh/${lib}@${version}`;
    console.log(`  ✅ Added ${lib} (v${version} for container)`);
  }
  
  // Add special cases for sub-paths - need to handle ALL React versions
  if (imports['react@17']) {
    // React 17 doesn't have /client subpath
    imports[`react-dom@17/client`] = `https://esm.sh/react-dom@17`;
  }
  
  if (imports['react@18']) {
    imports[`react-dom@18/client`] = `https://esm.sh/react-dom@18/client`;
    imports[`react@18/jsx-runtime`] = `https://esm.sh/react@18/jsx-runtime`;
    imports[`react@18/jsx-dev-runtime`] = `https://esm.sh/react@18/jsx-dev-runtime`;
  }
  
  if (imports['react@19']) {
    imports[`react-dom@19/client`] = `https://esm.sh/react-dom@19/client`;
    imports[`react@19/jsx-runtime`] = `https://esm.sh/react@19/jsx-runtime`;
    imports[`react@19/jsx-dev-runtime`] = `https://esm.sh/react@19/jsx-dev-runtime`;
  }
  
  console.log(`\n✅ Generated import map with ${Object.keys(imports).length} entries from ${mfeCount} MFEs`);
  
  return {
    imports,
    generated: new Date().toISOString(),
    mfeCount
  };
}

// Generate and save the import map
async function main() {
  const importMapData = await generateImportMap();
  
  // Update the index.html file with the generated import map
  const indexPath = path.join(rootDir, 'apps/container-react/index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  // Preserve the existing container dependencies and design system imports
  const containerImports = {
    "// Container dependencies (non-versioned)": "",
    "react": "https://esm.sh/react@19.1.0",
    "react/jsx-runtime": "https://esm.sh/react@19.1.0/jsx-runtime",
    "react/jsx-dev-runtime": "https://esm.sh/react@19.1.0/jsx-dev-runtime",
    "react-dom": "https://esm.sh/react-dom@19.1.0",
    "react-dom/client": "https://esm.sh/react-dom@19.1.0/client",
    "react-router-dom": "https://esm.sh/react-router-dom@6.21.1?deps=react@19.1.0",
    "lucide-react": "https://esm.sh/lucide-react@0.526.0?deps=react@19.1.0",
    "zustand": "https://esm.sh/zustand@5.0.6",
    "zustand/middleware": "https://esm.sh/zustand@5.0.6/middleware",
    
    "// MFE dependencies (versioned)": "",
    ...importMapData.imports,
    
    "// Shared internal packages": "",
    "@mfe/design-system": "http://localhost:8080/design-system/index.js",
    "@mfe/design-system/tokens": "http://localhost:8080/design-system/index.js",
    "@mfe/design-system/patterns": "http://localhost:8080/design-system/index.js"
  };
  
  // Create the import map script tag with proper formatting
  const importMapScript = `    <script type="importmap">
      {
        "imports": ${JSON.stringify(containerImports, null, 10).split('\n').map((line, i) => i === 0 ? line : '        ' + line).join('\n')}
      }
    </script>`;
  
  // Replace the existing import map in index.html
  const importMapRegex = /<script type="importmap">[\s\S]*?<\/script>/;
  if (importMapRegex.test(indexContent)) {
    indexContent = indexContent.replace(importMapRegex, importMapScript);
    fs.writeFileSync(indexPath, indexContent);
    console.log(`\n✅ Updated import map in ${indexPath} with ${Object.keys(importMapData.imports).length} MFE dependencies`);
  } else {
    console.warn('⚠️  Could not find import map in index.html to update');
  }
}

main().catch(console.error);