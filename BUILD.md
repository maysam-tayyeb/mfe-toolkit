# Build System

This project uses a hybrid build approach: the container application uses its default build system while MFEs use esbuild for fast, optimized builds. All outputs go to a shared `dist` folder for easy deployment.

## Build Architecture

- **Container**: Uses its own build system (configured in the container app)
- **MFEs**: Use esbuild with individual configurations per MFE
- **Shared Output**: All apps build to a unified `/dist` folder

## Build Commands

### Quick Start

```bash
# Build everything (container + all MFEs)
pnpm build

# Build only the container
pnpm build:container

# Build only the MFEs (in parallel)
pnpm build:mfes

# Build a specific MFE
cd apps/mfe-example && pnpm build
```

### Alternative Build Commands

```bash
# Build all packages in dependency order
pnpm build:all   # or pnpm -r build

# Use Vite build for specific MFEs (if configured)
pnpm build:vite
```

## Development vs Production

```bash
# Development (with hot reload)
pnpm dev                 # Start all apps in parallel
pnpm dev:container       # Start only container
pnpm dev:mfe            # Start specific MFE

# Production build + serve
pnpm build              # Build everything
pnpm serve              # Serve all from dist folder on port 8080
pnpm serve:mfes         # Same as serve (alias)
```

## Build Output Structure

After running `pnpm build`, all applications are built into the `dist` folder:

```
dist/
├── container/          # Main container application
│   ├── index.html
│   ├── main.js
│   └── chunks/        # Code-split chunks
├── mfe-example/       # Example MFE
│   └── mfe-example.js
├── mfe-react17/       # React 17 MFE
│   └── mfe-react17.js
├── mfe-event-demo/    # Event demo MFE
│   └── mfe-event-demo.js
├── mfe-state-demo-react/  # React state demo MFE
│   └── mfe-state-demo-react.js
└── mfe-state-demo-vue/    # Vue state demo MFE
    └── mfe-state-demo-vue.js
```

## Serving the Built Application

After building, use either command to serve:

```bash
pnpm serve       # Serve all built apps
pnpm serve:mfes  # Same as above (alias)
```

- Container app: http://localhost:8080/container/
- MFEs are loaded dynamically by the container
- Server runs with CORS enabled and cache disabled

## Build Configuration

### MFE Build Configuration (esbuild)

Each MFE has its own `esbuild.config.js` that:

- Outputs to the global `/dist/{mfe-name}/` folder
- Bundles as ES modules for dynamic imports
- Externalizes shared dependencies (React, Redux) via import maps
- Includes source maps for debugging
- Minifies code for production
- Each MFE manages its own esbuild dependency

Example from `apps/mfe-example/esbuild.config.js`:

```javascript
{
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outfile: path.join(rootDir, 'dist', 'mfe-example', 'mfe-example.js'),
  external: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux'],
  // ... other config
}
```

### Container Build Configuration

The container uses its own build system (check `apps/container/package.json`):

- Handles Tailwind CSS v4 with PostCSS
- Manages static assets and HTML
- Code splitting for optimal loading

### Development Configuration (Vite)

MFEs use Vite for development:

- Hot Module Replacement (HMR)
- Fast refresh for React/Vue
- TypeScript support

## Technical Details

### Build Tools

- **Container**: Uses its own build system
- **MFEs**: esbuild for production builds
- **Development**: Vite dev servers

### Build Characteristics

- **Output Format**: ES modules for all applications
- **Code Splitting**: Enabled for container app only
- **MFE Bundles**: Single file ES modules for easy loading
- **CSS Processing**: PostCSS with Tailwind CSS v4 (container)
- **Framework Support**: React (JSX/TSX) and Vue 3 (SFC)
- **Import Maps**: Used for sharing dependencies

### Bundle Sizes

- Example MFE: ~14KB (97% reduction with externals)
- React 17 MFE: ~158KB (includes React 17)
- Container: ~358KB (includes all shared deps)

### Dependencies

- esbuild is installed per-MFE (not at root)
- Container manages its own build dependencies
- Shared dependencies use pnpm workspace protocol

## MFE Registry

The MFE registry configuration differs by environment:

### Development Mode

- Each MFE runs on its own dev server (ports 3001-3005)
- Registry points to individual dev servers
- Hot Module Replacement enabled

### Production Mode

- All apps served from single HTTP server (port 8080)
- Registry uses relative URLs: `/mfe-example/mfe-example.js`
- Optimized bundles with minification

## Troubleshooting

### Common Build Issues

```bash
# Clean all build outputs
rm -rf dist

# Rebuild everything fresh
pnpm build

# Check bundle sizes
ls -lah dist/*/

# Verify MFE can be loaded
curl http://localhost:8080/mfe-example/mfe-example.js
```

### Build Performance

- esbuild provides fast production builds for MFEs
- Parallel MFE builds with `pnpm --parallel`
- Incremental builds supported in development mode
- Each MFE builds independently for better isolation
