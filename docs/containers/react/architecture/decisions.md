# React Container Architecture Decisions

This document captures React-specific architectural decisions for the container implementation.

## Decision Record Format

Each decision follows this format:

- **Decision**: What was decided
- **Date**: When the decision was made
- **Context**: Why the decision was needed
- **Options Considered**: What alternatives were evaluated
- **Decision Rationale**: Why this option was chosen
- **Implications**: What this means for the project

---

## 1. React Context API Over Redux for Container State

**Decision**: Use React Context API for container state management instead of Redux.

**Date**: January 2025

**Context**:
The container was using Redux for state management, but this created risks of state pollution between MFEs and added unnecessary complexity.

**Options Considered**:

1. **Keep Redux**: Continue with centralized Redux store
2. **React Context**: Use React's built-in Context API
3. **Zustand/Valtio**: Adopt a lighter state management library
4. **No Shared State**: Make container completely stateless

**Decision Rationale**:
We migrated to React Context because:

1. **Isolation**: Each context is naturally isolated, preventing cross-MFE state pollution
2. **Simplicity**: No additional dependencies or boilerplate
3. **Performance**: No unnecessary re-renders from unrelated state changes
4. **React Native**: Built into React, guaranteed compatibility
5. **Type Safety**: Better TypeScript integration with contexts

**Implications**:

- ✅ Reduced bundle size (removed Redux dependencies)
- ✅ Simpler state management
- ✅ Better MFE isolation
- ✅ Improved type safety
- ❌ No Redux DevTools
- ❌ Need to implement our own state persistence

**Implementation**:

```typescript
// AuthContext for authentication state
export const AuthContext = React.createContext<AuthContextType | null>(null);

// UIContext for UI state (modals, notifications)
export const UIContext = React.createContext<UIContextType | null>(null);

// RegistryContext for MFE registry
export const RegistryContext = React.createContext<RegistryContextType | null>(null);
```

---

## 2. Two MFE Loader Components Strategy

**Decision**: Maintain both `MFELoader` (with error boundaries) and `IsolatedMFELoader` (for frequently re-rendering pages).

**Date**: January 2025

**Context**:
MFEs were flickering on pages with frequent state updates due to re-mounting.

**Options Considered**:

1. **Single Universal Loader**: One loader that handles all cases
2. **Two Specialized Loaders**: Different loaders for different use cases
3. **Fix Re-rendering Issues**: Address the root cause in parent components

**Decision Rationale**:
We kept both loaders as a pragmatic solution:

1. **MFELoader**: For stable pages that need error boundary protection
2. **IsolatedMFELoader**: For pages with frequent updates (like MFE Communication page)

While not ideal architecturally, this approach:

- Solves the immediate flickering problem
- Maintains backward compatibility
- Allows gradual migration to better patterns

**Implications**:

- ✅ Immediate fix for flickering issues
- ✅ Flexibility for different use cases
- ❌ Technical debt (duplicate code)
- ❌ Confusion about which to use when
- 🔄 Plan to consolidate in the future

---

## 3. ShadCN UI Component Library

**Decision**: Use ShadCN UI for the container's component library.

**Date**: Initial development

**Context**:
Needed a modern, accessible, and customizable component library for the container UI.

**Options Considered**:

1. **Material UI**: Comprehensive but heavy
2. **Ant Design**: Feature-rich but opinionated
3. **ShadCN UI**: Copy-paste components with Radix UI
4. **Custom Components**: Build from scratch

**Decision Rationale**:

1. **No Dependencies**: Components are copied into the project
2. **Full Control**: Can modify any component as needed
3. **Modern Stack**: Built on Radix UI and Tailwind CSS
4. **Accessibility**: ARIA compliant out of the box
5. **Tree-Shakeable**: Only include what you use

**Implications**:

- ✅ Full control over components
- ✅ No version conflicts
- ✅ Smaller bundle size
- ✅ Easy customization
- ❌ Manual updates for fixes
- ❌ More initial setup

---

## 4. Vite as Build Tool

**Decision**: Use Vite for development and building the React container.

**Date**: Initial development

**Context**:
Needed a fast, modern build tool that supports ES modules natively.

**Decision Rationale**:

1. **Fast HMR**: Near-instant hot module replacement
2. **ES Modules First**: Aligns with our dynamic import strategy
3. **Simple Configuration**: Less complexity than Webpack
4. **Great DX**: Excellent developer experience
5. **Future-Proof**: Built on native ES modules

**Implications**:

- ✅ Faster development builds
- ✅ Better developer experience
- ✅ Simpler configuration
- ❌ Less ecosystem maturity than Webpack
- ❌ Some plugins may not be available

---

## 5. TypeScript Strict Mode

**Decision**: Enable TypeScript strict mode for the React container.

**Date**: Initial development

**Context**:
Needed to ensure type safety and catch potential bugs at compile time.

**Decision Rationale**:

1. **Type Safety**: Catch more bugs at compile time
2. **Better IntelliSense**: Improved IDE support
3. **Self-Documenting**: Types serve as documentation
4. **Refactoring Safety**: Confident code changes
5. **Best Practices**: Encourages better patterns

**Configuration**:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## Future Considerations

### React 19 Features to Adopt:

1. **Server Components**: For better performance
2. **Suspense for Data Fetching**: Improved loading states
3. **Concurrent Features**: Better user experience
4. **Compiler Optimizations**: Automatic performance improvements

### Potential Improvements:

1. **Consolidate MFE Loaders**: Merge into single, optimized component
2. **React Query Integration**: For data fetching and caching
3. **MSW for Development**: Mock Service Worker for API mocking
4. **Storybook Integration**: Component development in isolation

---

## References

- [React Context vs Redux](https://blog.logrocket.com/react-context-api-vs-redux/)
- [ShadCN UI Philosophy](https://ui.shadcn.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)