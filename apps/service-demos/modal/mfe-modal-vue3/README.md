# mfe-modal-vue3

## Description
mfe-modal-vue3 microfrontend built with vue.

## Development

```bash
# Install dependencies
pnpm install

# Start development build (watch mode)
pnpm dev

# Build for production
pnpm build

# Clean build artifacts
pnpm clean
```

## Library Versioning
This MFE uses the automatic library versioning system. The build process will:
1. Read the `manifest.json` to detect library versions
2. Apply the appropriate import aliasing at build time
3. Output code that uses versioned imports (e.g., `react@18`)

## Configuration
- **manifest.json**: Defines MFE metadata and dependencies
- **build.js**: Build configuration using `@mfe-toolkit/build`
- **tsconfig.json**: TypeScript configuration

## Integration
This MFE is designed to be loaded by the MFE container application.
The container provides shared dependencies via import maps.
