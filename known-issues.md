# Known Issues

## React 17 MFE Zustand State Management Conflict

**Date Discovered**: 2025-01-30  
**Status**: Open  
**Severity**: Medium  
**Affected Components**: `@mfe/react17-mfe`

### Description

The React 17 MFE's Zustand state management demo is currently disabled due to React hooks conflicts between the bundled React 17 and the shared React 19 from the import map.

### Technical Details

- React 17 MFE bundles its own React (v17.0.2) for compatibility demonstration
- Zustand hooks from `@mfe-toolkit/core` import React from the shared import map (React v19)
- This creates a "Cannot read properties of null (reading 'useState')" error
- The error occurs because React hooks from different React instances cannot be mixed

### Current Workaround

The Zustand state management demo has been temporarily commented out in the React 17 MFE.

### Potential Solutions

1. **Bundle Zustand with React 17 MFE**: Include Zustand in the React 17 bundle to ensure it uses the same React instance
2. **Create React 17-specific state hooks**: Implement state management hooks that don't rely on the shared Zustand
3. **Use non-hook based state**: Implement a class-based or non-React state solution for the React 17 MFE
4. **Upgrade to React 18+**: Consider upgrading the legacy MFE to React 18+ to use shared dependencies

### Impact

- React 17 MFE cannot demonstrate Zustand-based state management
- Other MFEs using the current React version are not affected
- Core functionality of the React 17 MFE remains intact

### Related Files

- `/apps/mfe-react17/src/App.tsx` (Line 594-603)
- `/apps/mfe-react17/src/components/LegacyStateDemo.tsx` (disabled)
- `/apps/mfe-react17/src/store/useReact17Store.ts` (unused)

---

## Resolved Issues

### Redux to React Context Migration

**Date Resolved**: 2025-01-30  
**Resolution**: Successfully migrated from Redux to React Context

- Removed Redux dependencies from container
- Implemented AuthContext and UIContext
- Created ContextBridge for MFE service integration
- Removed global window assignments
