# Build System with esbuild

This project uses esbuild with individual build configurations for each MFE, all outputting to a shared `dist` folder for easy deployment.

## Build Commands

```bash
# Build all apps (container + all MFEs)
pnpm build

# Build only the container
pnpm build:container

# Build only the MFEs (in parallel)
pnpm build:mfes

# Serve all built apps from dist folder
pnpm serve
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

After building, run `pnpm serve` to start a static HTTP server on port 8080:

- Container app: http://localhost:8080/container/
- MFEs are loaded dynamically by the container

The server runs with CORS enabled and cache disabled for development.

## Technical Details

- Each MFE has its own `esbuild.config.js` for build configuration
- All MFEs output to the global `/dist` folder
- Container uses code splitting for optimal loading
- MFEs are built as single ES module files
- Supports React (JSX/TSX) and Vue (SFC) components
- Handles CSS with PostCSS and Tailwind CSS v4
- ES modules output format for all applications

## MFE Registry

The MFE registry has been updated to use the new dist folder URLs:
- Development: Individual dev servers (ports 3001-3005)
- Production: All served from `/dist` via single HTTP server (port 8080)