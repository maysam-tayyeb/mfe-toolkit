# GitHub Pages Deployment Plan for MFE Toolkit

## Overview
Deploy the MFE container application to GitHub Pages while maintaining the ability to run locally. This plan uses the existing import map generator with environment-based configuration.

## Implementation Steps

### 1. Enhance Import Map Generator Script
**File:** `scripts/generate-import-map.ts`

- Add support for `NODE_ENV=production` environment variable
- When in production mode:
  - Replace `http://localhost:8080` with `https://[username].github.io/mfe-toolkit`
  - Update all design system URLs in the import map
  - Keep external CDN URLs (esm.sh) unchanged

Example changes:
```typescript
const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction 
  ? 'https://[username].github.io/mfe-toolkit'
  : 'http://localhost:8080';

// Later in the code:
"@mfe/design-system": `${baseUrl}/design-system/index.js`,
"@mfe/design-system/tokens": `${baseUrl}/design-system/index.js`,
"@mfe/design-system/patterns": `${baseUrl}/design-system/index.js`
```

### 2. Create Production MFE Registry
**File:** `apps/container-react/public/mfe-registry.production.json`

Copy the existing `mfe-registry.json` and update all MFE URLs:
- From: `http://localhost:8080/service-demos/event-bus/scenarios/trading/mfe-market-watch.js`
- To: `https://[username].github.io/mfe-toolkit/service-demos/event-bus/scenarios/trading/mfe-market-watch.js`

### 3. Update Vite Configuration
**File:** `apps/container-react/vite.config.ts`

Add base path configuration for GitHub Pages:
```typescript
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/mfe-toolkit/' : '/',
  // ... rest of existing config
});
```

### 4. Add Production Build Scripts
**File:** `package.json`

Add new scripts for GitHub Pages deployment:
```json
{
  "scripts": {
    "build:gh-pages": "pnpm build:packages && pnpm build:mfes && NODE_ENV=production pnpm generate:import-map && cd apps/container-react && GITHUB_PAGES=true vite build && cd ../.. && pnpm prepare:gh-pages",
    "prepare:gh-pages": "node scripts/prepare-gh-pages.js",
    "generate:import-map:prod": "NODE_ENV=production tsx scripts/generate-import-map.ts"
  }
}
```

### 5. Create Asset Preparation Script
**File:** `scripts/prepare-gh-pages.js`

Create a script to copy all necessary assets to the container's dist folder:
```javascript
import fs from 'fs-extra';
import path from 'path';

const rootDir = process.cwd();
const containerDist = path.join(rootDir, 'apps/container-react/dist');

// Copy MFEs
fs.copySync(
  path.join(rootDir, 'dist/service-demos'),
  path.join(containerDist, 'service-demos')
);

// Copy design system
fs.copySync(
  path.join(rootDir, 'dist/design-system'),
  path.join(containerDist, 'design-system')
);

// Copy production registry
fs.copySync(
  path.join(rootDir, 'apps/container-react/public/mfe-registry.production.json'),
  path.join(containerDist, 'mfe-registry.production.json')
);

console.log('✅ Assets prepared for GitHub Pages deployment');
```

### 6. Create GitHub Actions Workflow
**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Build for GitHub Pages
        run: pnpm build:gh-pages
        env:
          GITHUB_REPOSITORY: ${{ github.repository }}
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./apps/container-react/dist
          
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 7. Update Registry Context
**File:** `apps/container-react/src/contexts/RegistryContext.tsx`

Add logic to load the production registry when deployed to GitHub Pages:
```typescript
const getRegistryUrl = () => {
  const isProduction = window.location.hostname.includes('github.io');
  if (isProduction) {
    return '/mfe-toolkit/mfe-registry.production.json';
  }
  return import.meta.env.VITE_MFE_REGISTRY_URL || '/mfe-registry.json';
};
```

## Testing Plan

### Local Development Testing
1. Run `pnpm dev:container-react` - Should work as before with localhost URLs
2. Run `pnpm serve` - MFEs should be served on port 8080
3. Verify all MFEs load correctly from localhost

### Production Build Testing
1. Run `pnpm build:gh-pages` locally
2. Use `npx serve apps/container-react/dist` to test the production build
3. Verify that the import map has been updated with production URLs
4. Check that all assets are in the correct location

### GitHub Pages Testing
1. Push to main branch to trigger deployment
2. Access at `https://[username].github.io/mfe-toolkit`
3. Verify all MFEs load from GitHub Pages URLs
4. Check browser console for any CORS or loading errors

## Important Notes

- Replace `[username]` with your actual GitHub username
- The repository must be named `mfe-toolkit` for the URLs to work correctly
- GitHub Pages must be enabled in repository settings
- The workflow requires Pages permissions in repository settings

## Rollback Plan
If issues occur:
1. Keep the original files unchanged until testing is complete
2. The local development workflow remains unaffected
3. Can disable GitHub Actions workflow if needed
4. Original `pnpm build` command still works for standard builds

## Next Steps
1. Implement each step in order
2. Test locally first
3. Create a test branch for initial GitHub Pages deployment
4. Merge to main once confirmed working