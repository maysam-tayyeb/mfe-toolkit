# Modal Service Demo MFEs - Implementation Guidelines

## Overview

This document provides implementation guidelines for creating modal service demo MFEs in different frameworks. Currently implemented: React 17 and React 19. Remaining: Vue 3 and Vanilla TypeScript.

## Completed Implementations

### ✅ React 19 Modal Demo (`mfe-react19-modal-demo`)
- **Location**: `apps/service-demos/modal/mfe-react19-modal-demo/`
- **Features**: Full modal service capabilities with React components
- **Build**: ESBuild with automatic JSX transform
- **Bundle Size**: ~12KB (external React)

### ✅ React 17 Modal Demo (`mfe-react17-modal-demo`)
- **Location**: `apps/service-demos/modal/mfe-react17-modal-demo/`
- **Features**: Limited to plain text content due to cross-version constraints
- **Build**: ESBuild with classic JSX transform
- **Bundle Size**: ~143KB (bundled React)

## Remaining Implementations

### 🔄 Vue 3 Modal Demo (`mfe-vue3-modal-demo`)

#### Project Structure
```
apps/service-demos/modal/mfe-vue3-modal-demo/
├── src/
│   ├── main.ts          # MFE entry point
│   ├── App.vue          # Main component
│   └── vite-env.d.ts    # Type definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
├── esbuild.config.js    # Alternative build
└── README.md
```

#### Key Implementation Details

**1. Package.json**
```json
{
  "name": "mfe-vue3-modal-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@mfe-toolkit/core": "workspace:*",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "~5.7.0",
    "vite": "^6.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

**2. Main Entry Point (main.ts)**
```typescript
import { createApp } from 'vue';
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';
import App from './App.vue';

const vue3ModalDemo: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    const app = createApp(App, { services });
    app.mount(element);
    
    // Store app instance for cleanup
    (element as any).__vueApp = app;
  },
  unmount: (element: HTMLElement) => {
    const app = (element as any).__vueApp;
    if (app) {
      app.unmount();
      delete (element as any).__vueApp;
    }
  },
};

export default vue3ModalDemo;
```

**3. App Component Structure (App.vue)**
```vue
<template>
  <div class="p-4 space-y-4">
    <!-- Header with version badge -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Vue 3 Modal Demo</h3>
      <span class="text-xs font-mono bg-muted px-2 py-1 rounded">
        Vue {{ vueVersion }}
      </span>
    </div>

    <!-- 8 Demo Buttons in 2-column grid -->
    <div class="space-y-3">
      <div class="text-sm font-medium text-muted-foreground mb-2">
        Test Modal Service:
      </div>
      <div class="grid grid-cols-2 gap-3">
        <!-- Buttons here -->
      </div>
    </div>

    <!-- Event Log -->
    <div class="border border-border rounded-lg p-4 bg-card">
      <!-- Event log implementation -->
    </div>

    <!-- Vue 3 Compatibility Info -->
    <div class="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <!-- Compatibility information -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, version as vueVersion } from 'vue';
import type { MFEServices } from '@mfe-toolkit/core';

const props = defineProps<{
  services: MFEServices
}>();

const events = ref<string[]>([]);
const { modal, notification } = props.services;

// Implement all 8 handlers matching React versions
</script>
```

#### Vue 3 Specific Considerations

1. **Content Limitations**: Vue 3 MFEs can only pass **plain text strings** to the React 19 container's modal service
2. **No Vue Components**: Cannot pass Vue components as modal content
3. **Event Handling**: Cannot use Vue event handlers in modal content
4. **Styling**: Must use inline styles or rely on container's styles

#### Feature Implementation

| Feature | Vue 3 Support | Notes |
|---------|--------------|-------|
| Simple Alert | ✅ Full | Plain text content |
| Confirmation Dialog | ✅ Full | Callbacks work normally |
| Form Modal | ⚠️ Limited | Text description only, no actual form |
| Custom Content | ⚠️ Limited | Plain text with formatting |
| Error Example | ✅ Full | Error notifications work |
| Multiple Notifications | ✅ Full | All notification types work |
| Nested Modals | ❌ No | Cannot create interactive triggers |
| Size Variations | ✅ Full | All sizes work |

---

### 🔄 Vanilla TypeScript Modal Demo (`mfe-vanilla-modal-demo`)

#### Project Structure
```
apps/service-demos/modal/mfe-vanilla-modal-demo/
├── src/
│   ├── main.ts          # MFE entry point
│   ├── app.ts           # Main application logic
│   └── styles.css       # Optional styles
├── package.json
├── tsconfig.json
├── esbuild.config.js    # Primary build tool
└── README.md
```

#### Key Implementation Details

**1. Package.json**
```json
{
  "name": "mfe-vanilla-modal-demo",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && node esbuild.config.js",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@mfe-toolkit/core": "workspace:*"
  },
  "devDependencies": {
    "esbuild": "^0.24.0",
    "typescript": "~5.7.0",
    "vite": "^6.0.0"
  }
}
```

**2. Main Entry Point (main.ts)**
```typescript
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';
import { createApp, destroyApp } from './app';

const vanillaModalDemo: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    createApp(element, services);
  },
  unmount: (element: HTMLElement) => {
    destroyApp(element);
  },
};

export default vanillaModalDemo;
```

**3. App Implementation (app.ts)**
```typescript
import type { MFEServices } from '@mfe-toolkit/core';

let cleanup: (() => void) | null = null;

export function createApp(element: HTMLElement, services: MFEServices) {
  const { modal, notification } = services;
  const events: string[] = [];
  
  // Create DOM structure
  element.innerHTML = `
    <div class="p-4 space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Vanilla TS Modal Demo</h3>
        <span class="text-xs font-mono bg-muted px-2 py-1 rounded">
          Vanilla TypeScript
        </span>
      </div>
      
      <!-- Buttons -->
      <div class="space-y-3">
        <div class="text-sm font-medium text-muted-foreground mb-2">
          Test Modal Service:
        </div>
        <div class="grid grid-cols-2 gap-3" id="button-container">
          <!-- Buttons will be added here -->
        </div>
      </div>
      
      <!-- Event Log -->
      <div class="border border-border rounded-lg p-4 bg-card">
        <div class="text-sm font-medium mb-3">Event Log:</div>
        <div id="event-log" class="space-y-1">
          <div class="text-sm text-muted-foreground">
            No events yet. Click a button to start.
          </div>
        </div>
      </div>
      
      <!-- Compatibility Info -->
      <div class="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <!-- Add compatibility info -->
      </div>
    </div>
  `;
  
  // Add event listeners
  const buttonContainer = element.querySelector('#button-container');
  
  // Create buttons
  const buttons = [
    { text: 'Simple Alert', handler: handleSimpleAlert },
    { text: 'Confirmation Dialog', handler: handleConfirmation },
    // ... other buttons
  ];
  
  buttons.forEach(({ text, handler }) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 ...';
    button.addEventListener('click', handler);
    buttonContainer?.appendChild(button);
  });
  
  // Store cleanup function
  cleanup = () => {
    // Remove event listeners
  };
}

export function destroyApp(element: HTMLElement) {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  element.innerHTML = '';
}
```

#### Vanilla TypeScript Specific Considerations

1. **Pure JavaScript**: No framework overhead, smallest bundle size
2. **Manual DOM Management**: Need to handle DOM creation and cleanup
3. **Event Management**: Manual event listener attachment/removal
4. **Content Limitations**: Same as Vue - plain text only for modal content
5. **Type Safety**: Full TypeScript support despite no framework

#### Feature Implementation

| Feature | Vanilla TS Support | Notes |
|---------|-------------------|-------|
| Simple Alert | ✅ Full | Plain text content |
| Confirmation Dialog | ✅ Full | Callbacks work normally |
| Form Modal | ⚠️ Limited | Text description only |
| Custom Content | ⚠️ Limited | Plain text with formatting |
| Error Example | ✅ Full | Error notifications work |
| Multiple Notifications | ✅ Full | All notification types work |
| Nested Modals | ❌ No | Cannot create interactive triggers |
| Size Variations | ✅ Full | All sizes work |

---

## Common Implementation Requirements

### 1. Consistent UI Layout
All demos must have:
- Header with framework name and version badge
- 8 demo buttons in a 2-column grid
- Event log showing last 5 events
- Framework-specific compatibility info box

### 2. Button Order
1. Simple Alert
2. Confirmation Dialog
3. Form Modal
4. Custom Content
5. Error Example
6. Multiple Notifications
7. Nested Modals
8. Size Variations

### 3. Color Themes for Compatibility Boxes
- **React 19**: Green (success) - Full capabilities
- **React 17**: Amber (warning) - Limited capabilities
- **Vue 3**: Blue (info) - Framework differences
- **Vanilla TS**: Purple (neutral) - Pure implementation

### 4. Build Configuration
- Primary build tool: ESBuild for performance
- TypeScript for type safety
- Minimize bundle size where possible
- Include source maps for debugging

### 5. Testing Checklist
- [ ] All 8 buttons present and functional
- [ ] Event log updates correctly
- [ ] Notifications appear properly
- [ ] Modal sizes work (sm, md, lg, xl)
- [ ] Error handling works
- [ ] Cleanup on unmount works
- [ ] No console errors

### 6. Documentation Requirements
Each MFE must have:
- README.md explaining the implementation
- Comments for complex logic
- Type definitions for all functions
- Clear separation of concerns

## Registry Configuration

Add to `apps/container-react/public/mfe-registry.json`:

```json
{
  "name": "mfe-vue3-modal-demo",
  "version": "1.0.0",
  "url": "http://localhost:8080/service-demos/modal/mfe-vue3-modal-demo/mfe-vue3-modal-demo.js",
  "dependencies": {
    "runtime": { "vue": "*" },
    "peer": {}
  },
  "compatibility": {
    "container": ">=1.0.0",
    "frameworks": { "vue": ">=3.4.0" }
  },
  "requirements": {
    "services": [
      { "name": "modal", "optional": false },
      { "name": "notification", "optional": false },
      { "name": "logger", "optional": true }
    ]
  },
  "metadata": {
    "displayName": "Vue 3 Modal Demo",
    "description": "Modal service demonstration using Vue 3",
    "icon": "💚",
    "category": "demo",
    "tags": ["modal", "vue3", "service-demo"]
  }
}
```

## Development Workflow

1. **Create project structure** following the templates above
2. **Implement core functionality** with all 8 demo features
3. **Add compatibility information** specific to the framework
4. **Test thoroughly** using the testing checklist
5. **Build and verify** bundle size is optimal
6. **Update registry** to include the new MFE
7. **Update Modal Service Demo page** to display the new demo

## Key Differences Summary

| Framework | Bundle Strategy | Content Support | Event Handlers | Bundle Size |
|-----------|----------------|-----------------|----------------|-------------|
| React 19 | External React | Full JSX | ✅ Full | ~12KB |
| React 17 | Bundled React | Plain text only | ❌ None | ~143KB |
| Vue 3 | Bundled Vue | Plain text only | ❌ None | ~50-60KB (est.) |
| Vanilla TS | No framework | Plain text only | ❌ None | ~5-10KB (est.) |

## Success Criteria

A modal service demo MFE is considered complete when:
1. ✅ All 8 demo features are implemented
2. ✅ Event logging works correctly
3. ✅ Compatibility section clearly explains limitations
4. ✅ Build process is optimized
5. ✅ No runtime errors or warnings
6. ✅ Documentation is complete
7. ✅ Integrated into the Modal Service Demo page

## Notes for Implementers

- **Focus on demonstrating capabilities AND limitations** of each framework
- **Keep bundle sizes minimal** - use external dependencies where possible
- **Maintain consistent UX** across all demos despite framework differences
- **Document framework-specific workarounds** clearly
- **Test cross-browser compatibility** (Chrome, Firefox, Safari, Edge)

## Questions or Issues?

If you encounter any issues or have questions about implementation:
1. Check existing React 17/19 implementations for reference
2. Ensure you're following the MFE toolkit patterns
3. Test in isolation before integrating with the container
4. Document any framework-specific limitations discovered