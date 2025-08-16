# mfe-modal-react17

## Description
React 17 modal microfrontend with legacy ReactDOM.render API support.

## Features
- React 17 with legacy render API
- Full backwards compatibility
- Modal service integration
- Design system integration
- TypeScript support

## Development

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Build in watch mode
pnpm build:watch

# Clean build artifacts
pnpm clean
```

## React 17 Specifics
This MFE uses React 17's legacy API:
- `ReactDOM.render()` instead of `createRoot()`
- `ReactDOM.unmountComponentAtNode()` for cleanup
- Compatible with older React codebases

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
