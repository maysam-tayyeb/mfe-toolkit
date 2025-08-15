# MFE Build Examples

## Generic Library Versioning Examples

### 1. Auto-detect from manifest.json
```javascript
import { buildMFE } from '@mfe-toolkit/core';

// Automatically detects library versions from manifest.json
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json' // Auto-detects React 17, Vue 3, etc.
});
```

### 2. Explicit version specification
```javascript
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  libraryVersions: {
    'react': '17',
    'lodash': '4',
    'rxjs': '7',
    'zustand': '5'
  }
});
```

### 3. Custom library strategies
```javascript
import { buildMFE, createAliasStrategy } from '@mfe-toolkit/core';

// Define custom strategy for your internal library
const myLibStrategy = createAliasStrategy(
  '@mycompany/ui-lib',
  /^2\./,  // Match version 2.x
  '@v2',   // Use @mycompany/ui-lib@v2
  {
    additionalImports: [
      '@mycompany/ui-lib/components',
      '@mycompany/ui-lib/hooks'
    ]
  }
);

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json',
  customStrategies: [myLibStrategy]
});
```

### 4. Multiple library versions in one build
```javascript
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  libraryVersions: {
    'react': '18',      // Uses react@18
    'lodash': '4',      // Uses lodash@4
    'moment': '2',      // Uses moment@2
    'd3': '7',          // Uses d3@7
    'three': '0.150'    // Uses three@0.150
  }
});
```

### 5. Framework-specific configurations

#### React 17 MFE
```javascript
// manifest.json
{
  "dependencies": {
    "runtime": {
      "react": "^17.0.2",
      "lodash": "^4.17.21"
    }
  }
}

// build.js
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe.js',
  manifestPath: './manifest.json'
});
// Output uses: react@17, react-dom@17, lodash@4
```

#### Vue 3 with Pinia
```javascript
// manifest.json
{
  "dependencies": {
    "runtime": {
      "vue": "^3.4.0",
      "pinia": "^2.1.0",
      "lodash": "^4.17.21"
    }
  }
}

// build.js
await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe.js',
  manifestPath: './manifest.json'
});
// Output uses: vue@3, pinia (no version needed), lodash@4
```

#### Mixed React versions in monorepo
```javascript
// MFE 1 - React 17
await buildMFE({
  entry: 'apps/legacy/src/main.tsx',
  outfile: 'dist/legacy.js',
  libraryVersions: { 'react': '17' }
});

// MFE 2 - React 18
await buildMFE({
  entry: 'apps/modern/src/main.tsx',
  outfile: 'dist/modern.js',
  libraryVersions: { 'react': '18' }
});

// MFE 3 - React 19 (default, no aliasing needed)
await buildMFE({
  entry: 'apps/latest/src/main.tsx',
  outfile: 'dist/latest.js'
  // No version specified - uses default imports
});
```

### 6. Complex enterprise scenario
```javascript
import { buildMFE, createAliasStrategy } from '@mfe-toolkit/core';

// Enterprise with multiple versions of internal libraries
const strategies = [
  // Legacy auth library
  createAliasStrategy('@corp/auth', /^1\./, '@legacy', {
    additionalImports: ['@corp/auth/tokens', '@corp/auth/providers']
  }),
  
  // Current auth library
  createAliasStrategy('@corp/auth', /^2\./, '@v2', {
    additionalImports: ['@corp/auth/oauth', '@corp/auth/saml']
  }),
  
  // Design system versions
  createAliasStrategy('@corp/design', /^4\./, '@v4'),
  createAliasStrategy('@corp/design', /^5\./, '@v5', {
    additionalImports: ['@corp/design/themes', '@corp/design/icons']
  })
];

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/enterprise-mfe.js',
  manifestPath: './manifest.json',
  customStrategies: strategies,
  libraryVersions: {
    'react': '18',
    'ag-grid-react': '30',
    'highcharts': '10'
  }
});
```

### 7. CLI usage
```bash
# Auto-detect from manifest
npx mfe-build src/main.tsx -o dist/bundle.js

# Specify versions via CLI
npx mfe-build src/main.tsx -o dist/bundle.js \
  --versions '{"react":"17","lodash":"4"}'

# Use custom manifest path
npx mfe-build src/main.tsx -o dist/bundle.js \
  --manifest package.json
```

## How It Works

1. **Detection Phase**: Reads manifest.json to find library versions
2. **Strategy Matching**: Matches versions against strategies (default + custom)
3. **Alias Generation**: Creates import aliases (e.g., `react` → `react@17`)
4. **Build Configuration**: Applies aliases to esbuild config
5. **Compilation**: esbuild handles the actual aliasing during build

## Benefits

- ✅ **Generic**: Works with ANY library, not just React
- ✅ **Extensible**: Add custom strategies for your libraries
- ✅ **Zero Runtime Overhead**: Aliasing happens at build time
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Backward Compatible**: Existing builds continue to work
- ✅ **Smart Defaults**: Common libraries handled automatically
- ✅ **Flexible**: Mix auto-detection with explicit versions

## Supported Libraries (Default Strategies)

- React (17, 18, 19)
- Vue (2, 3)
- Angular (15+)
- Lodash (4)
- RxJS (6, 7)
- Zustand (4, 5)
- Any library you configure!