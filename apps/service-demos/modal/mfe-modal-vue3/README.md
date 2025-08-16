# mfe-modal-vue

## Description
Vue 3 modal microfrontend with Composition API and reactive state management.

## Features
- Vue 3 with Composition API
- Script setup syntax
- TypeScript support
- Reactive state management
- Modal service integration
- Design system integration

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

## Vue 3 Specifics
This MFE leverages Vue 3's modern features:
- Composition API for better logic composition
- `<script setup>` for cleaner component code
- Improved TypeScript integration
- Teleport for modal rendering
- Fragment support

## Integration
Designed to be loaded by the MFE container application with shared dependencies via import maps.
