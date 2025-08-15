# Build System Architecture

## Overview

The MFE toolkit provides a unified build system that automatically handles dependency externalization and versioning for microfrontends. This document describes the architecture, decisions, and implementation details.

## Key Principles

1. **Automatic Dependency Detection**: All dependencies are automatically detected from manifest.json
2. **No Bundling of External Dependencies**: Framework and library code is never bundled into MFEs
3. **Versioned Imports**: Dependencies use versioned imports (e.g., `react@18`) for multi-version support
4. **Generic Implementation**: No hardcoded library-specific logic in the core build system
5. **Consistent Tooling**: All MFEs use esbuild as the bundler via the buildMFE utility

## Build Pipeline

### 1. Package Building (Toolkit)

The toolkit packages are built using **tsup** (powered by esbuild):

```typescript
// packages/mfe-toolkit-core/tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  external: ['esbuild'],
  noExternal: ['ajv', 'ajv-formats'], // Bundle validation libraries
});
```

**Why tsup for packages?**
- Cleaner output structure (single bundle file)
- Better TypeScript support with automatic .d.ts generation
- No in-place .js files alongside .ts sources
- Simpler configuration than raw esbuild

### 2. MFE Building

MFEs are built using **esbuild** via the `buildMFE` utility:

```javascript
// apps/service-demos/*/build.js
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-name.js',
  manifestPath: './manifest.json'
});
```

**Why esbuild for MFEs?**
- Fast build times (critical for development)
- Native plugin support for frameworks (Vue, Solid.js)
- Excellent tree-shaking and minification
- Direct control over externalization

## Automatic Dependency Externalization

The `buildMFE` utility automatically:

1. **Reads manifest.json** to discover all dependencies
2. **Extracts major versions** from semver patterns (^18.0.0 → 18)
3. **Creates versioned aliases** (react → react@18)
4. **Marks everything as external** to prevent bundling

### How It Works

```typescript
// Simplified implementation
function detectDependencies(manifestPath: string, useVersionedImports: boolean) {
  const manifest = JSON.parse(readFileSync(manifestPath));
  
  // Collect all dependencies
  const allDeps = {
    ...manifest.dependencies?.runtime,
    ...manifest.dependencies?.peer,
    ...manifest.dependencies,
    ...manifest.peerDependencies,
  };
  
  // Process each dependency
  for (const [library, versionSpec] of Object.entries(allDeps)) {
    const majorVersion = extractMajorVersion(versionSpec); // "^18.0.0" → "18"
    
    if (useVersionedImports) {
      // Create versioned alias: react → react@18
      aliases[library] = `${library}@${majorVersion}`;
      external.add(`${library}@${majorVersion}`);
    } else {
      external.add(library);
    }
  }
  
  return { aliases, external };
}
```

### Generic vs Library-Specific

**Before (Library-Specific):**
- Had hardcoded strategies for React, Vue, Lodash, etc.
- Required maintaining library-specific version patterns
- Complex configuration with multiple strategy definitions

**After (Generic):**
- Automatically detects ALL dependencies from manifest
- No library-specific knowledge in core logic
- Minimal special handling only for common subpaths (react/jsx-runtime, etc.)

## Versioned Import Strategy

### Import Map Configuration

The container provides dependencies via import map with both versioned and non-versioned entries:

```html
<script type="importmap">
{
  "imports": {
    "// Container dependencies (non-versioned)": "",
    "react": "https://esm.sh/react@19.1.0",
    "react-dom": "https://esm.sh/react-dom@19.1.0",
    
    "// MFE dependencies (versioned)": "",
    "react@17": "https://esm.sh/react@17.0.2",
    "react@18": "https://esm.sh/react@18.3.1",
    "react@19": "https://esm.sh/react@19.1.0",
    "vue@3": "https://esm.sh/vue@3.4.21",
    "solid-js@1": "https://esm.sh/solid-js@1.8.19"
  }
}
</script>
```

### Build-Time Aliasing

During build, imports are automatically aliased:

```javascript
// Source code
import React from 'react';

// After build (for React 18 MFE)
import React from 'react@18';
```

This happens transparently without changing source code.

## MFE Dependencies

### Standard Dependencies

Every MFE should have these devDependencies:

```json
{
  "devDependencies": {
    "@mfe-toolkit/core": "workspace:*",  // For buildMFE utility
    "esbuild": "^0.19.11",                // Bundler
    "typescript": "^5.3.3"                 // TypeScript support
  }
}
```

### Framework-Specific Additions

**React MFEs:**
```json
{
  "dependencies": {
    // React versions handled via import map
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

**Vue MFEs:**
```json
{
  "dependencies": {
    "vue": "^3.4.0"  // For type checking
  },
  "devDependencies": {
    "esbuild-plugin-vue3": "^0.4.2"
  }
}
```

**Solid.js MFEs:**
```json
{
  "dependencies": {
    "solid-js": "^1.8.19"  // For type checking
  },
  "devDependencies": {
    "esbuild-plugin-solid": "^0.5.0"
  }
}
```

## Migration from tsc to tsup

We migrated all package builds from TypeScript compiler (tsc) to tsup because:

1. **Cleaner output**: No .js files mixed with .ts sources
2. **Single bundle**: Better for distribution as npm packages
3. **Faster builds**: esbuild under the hood
4. **Better defaults**: Automatic sourcemaps, minification, tree-shaking

### Before (tsc)
```
packages/mfe-toolkit-core/
├── src/
│   ├── index.ts
│   ├── index.js      # Generated in-place ❌
│   └── index.js.map
└── dist/
    └── (empty or types only)
```

### After (tsup)
```
packages/mfe-toolkit-core/
├── src/
│   └── index.ts      # Clean source ✅
└── dist/
    ├── index.js      # Bundle here ✅
    ├── index.js.map
    └── index.d.ts
```

## Build Configuration Examples

### Simple MFE (Vanilla TypeScript)

```javascript
// build.js
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-name.js',
  manifestPath: './manifest.json'
});
```

### MFE with Plugin (Solid.js)

```javascript
// build.js
import { buildMFE } from '@mfe-toolkit/core';
import { solidPlugin } from 'esbuild-plugin-solid';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-name.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [solidPlugin()]
  }
});
```

## Key Decisions

### 1. Why Not Bundle Dependencies?

- **Shared dependencies**: Multiple MFEs can share the same React/Vue/etc instance
- **Smaller bundles**: Each MFE only contains its own code
- **Version flexibility**: Container can provide different versions for different MFEs
- **Cache efficiency**: Framework code cached once, used by all MFEs

### 2. Why Versioned Imports?

- **Multi-version support**: Run React 17, 18, and 19 MFEs simultaneously
- **Gradual migration**: Update MFEs to new framework versions independently
- **Explicit dependencies**: Clear about which version each MFE uses
- **No conflicts**: Different versions don't interfere with each other

### 3. Why esbuild?

- **Performance**: Fastest bundler available (10-100x faster than webpack)
- **Simplicity**: Minimal configuration required
- **ESM native**: Built for ES modules from the ground up
- **Active development**: Well-maintained and constantly improving

### 4. Why Keep esbuild in All MFEs?

- **Consistency**: All MFEs have the same dependency structure
- **Plugin compatibility**: Plugins need peer dependency on esbuild
- **Simplicity**: No need to think about when it's needed or not
- **Future-proof**: Ready if someone adds a plugin later

## Troubleshooting

### Common Issues

**1. "Cannot find package '@mfe-toolkit/core'"**
- Run `pnpm install` to link workspace packages
- Ensure package is built: `pnpm build:packages`

**2. "Dynamic require of 'fs' is not supported"**
- Check tsup config has `platform: 'node'`
- Ensure esbuild is marked as external in tsup config

**3. MFE not loading in container**
- Check MFE is registered in `mfe-registry.json`
- Verify manifest.json has correct URL
- Ensure MFE is built and served from dist/

**4. Import not found at runtime**
- Check import map includes the dependency
- Verify versioned import is correct (react@18 not react@18.0.0)
- Ensure dependency is marked as external in build

## Future Improvements

1. **Auto-detect plugin requirements**: Automatically include necessary plugins based on file extensions
2. **Build caching**: Implement incremental builds for faster development
3. **Bundle analysis**: Add tools to analyze and optimize bundle sizes
4. **Type checking**: Integrate TypeScript checking into build process
5. **Source maps**: Improve source map handling for better debugging

## Summary

The build system provides:
- ✅ Automatic dependency externalization
- ✅ Generic implementation (no library-specific code)
- ✅ Versioned imports for multi-version support
- ✅ Consistent tooling across all MFEs
- ✅ Simple configuration with smart defaults
- ✅ Fast builds with esbuild
- ✅ Clean package output with tsup

This architecture ensures MFEs remain small, load fast, and can coexist with different framework versions in the same application.