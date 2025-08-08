# Architecture Decisions

This document captures important architectural decisions made in the MFE Made Easy project, including the rationale behind them and their implications.

## Decision Record Format

Each decision follows this format:

- **Decision**: What was decided
- **Date**: When the decision was made
- **Context**: Why the decision was needed
- **Options Considered**: What alternatives were evaluated
- **Decision Rationale**: Why this option was chosen
- **Implications**: What this means for the project

---

## 1. Dynamic Imports Over Module Federation

**Decision**: Use dynamic ES module imports instead of Webpack Module Federation for loading MFEs.

**Date**: January 2025

**Context**:
The team needed to choose between Module Federation (build-time integration) and dynamic imports (runtime integration) for the microfrontend architecture.

**Options Considered**:

1. **Webpack Module Federation**: Build-time sharing of dependencies with automatic version negotiation
2. **Dynamic ES Module Imports**: Runtime loading of independently built and deployed modules
3. **Hybrid Approach**: Module Federation for dev, dynamic imports for production

**Decision Rationale**:
We chose dynamic imports for several compelling reasons:

1. **True Independence**: Each MFE can be developed, built, and deployed completely independently without any build-time coupling
2. **Technology Freedom**: Teams can use any build tool (Webpack, Vite, Rollup, esbuild) or framework version
3. **Deployment Flexibility**: MFEs can be hosted on different domains, CDNs, or edge locations
4. **Simpler Mental Model**: It's just loading JavaScript files - no complex configuration or coordination needed
5. **Multi-Team Scalability**: Perfect for scenarios where different companies or teams own different MFEs
6. **Security Isolation**: Better security boundaries between MFEs
7. **No Version Lock-in**: No need to coordinate framework or dependency versions across teams

**Implications**:

- ✅ Maximum flexibility and independence
- ✅ Simpler deployment and operations
- ✅ Better fault isolation
- ❌ Larger overall bundle sizes (each MFE bundles its own dependencies)
- ❌ No automatic dependency sharing
- ❌ Need to implement our own version management

**Implementation Example**:

```javascript
// Our approach - completely decoupled
const module = await import(/* @vite-ignore */ url);
module.default.mount(container, services);

// vs Module Federation - build-time coupling
import('remoteMFE/Component'); // Needs configuration at build time
```

---

## 2. React Context API Over Redux for Container State

**Decision**: Replace Redux with React Context API for container state management.

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

---

## 3. Two MFE Loader Components Strategy

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

## 4. Event-Driven Communication

**Decision**: Use a centralized event bus for inter-MFE communication.

**Date**: Initial architecture

**Context**:
MFEs need to communicate without direct dependencies.

**Decision Rationale**:

- Loose coupling between MFEs
- Can be enhanced with typing later
- Simple pub/sub pattern
- Works across frameworks

**Implications**:

- ✅ Framework agnostic communication
- ✅ Debugging via event logs
- ❌ No type safety (yet)
- ❌ Potential for event storms

---

## 5. Services Injection Pattern

**Decision**: Inject services into MFEs at mount time rather than using global objects.

**Date**: January 2025 (Fully completed August 2025)

**Context**:
Originally services and state were exposed via multiple global window properties:

- `window.__MFE_SERVICES__` - Service instances
- `window.__EVENT_BUS__` - Event bus instance
- `window.__REDUX_STORE__` - Redux store
- `window.__MFE_STATE__` - State manager debugging
- `window.__MFE_UNIVERSAL_STATE__` - Universal state debugging
- `window.__STATE_MANAGER_IMPL__` - Implementation tracking

**Decision Rationale**:

- Better security (no global exposure)
- Easier testing (can mock services)
- Cleaner API contracts
- Proper dependency injection
- Compliance with "no global pollution" policy

**Implementation**:

```javascript
// Instead of accessing window.__MFE_SERVICES__
export default {
  mount: (container, services) => {
    // Services injected directly
    const { logger, eventBus, modal } = services;
  },
};
```

**Completion Notes** (August 2025):

- All window pollution has been removed from production code
- Test files now export mocks instead of polluting window
- Debugging uses console logging instead of window exposure
- Chrome DevTools integration maintained through proper Valtio devtools

---

## Future Considerations

### Potential Future Decisions:

1. **Import Maps**: For better dependency management without Module Federation
2. **Web Components**: For true framework-agnostic MFEs
3. **Service Workers**: For offline capability and caching
4. **Edge Deployment**: For better global performance

### Principles for Future Decisions:

1. **Independence First**: Prioritize MFE independence over optimization
2. **Runtime Over Build-time**: Prefer runtime integration for flexibility
3. **Standards Over Frameworks**: Use web standards where possible
4. **Simple Over Clever**: Choose boring technology that works

---

## 6. Dual State Management System

**Decision**: Use ContextBridge for container services and Universal State Manager for application state.

**Date**: January 2025

**Context**:
MFEs need both container-provided UI services and shared application state, but these have different characteristics and requirements.

**Decision Rationale**:

- **Clear separation of concerns**: UI services vs business state
- **Appropriate tools**: Imperative APIs for services, reactive state for data
- **Framework flexibility**: Universal State works with any framework
- **Scalability**: Each system can evolve independently

**Implementation**:

- See [State Management Architecture](./state-management-architecture.md) for detailed documentation

---

## References

- [Martin Fowler on Micro Frontends](https://martinfowler.com/articles/micro-frontends.html)
- [Module Federation vs Dynamic Imports](https://blog.bitsrc.io/module-federation-vs-dynamic-imports)
- [Micro Frontend Architecture Patterns](https://medium.com/@lucamezzalira/micro-frontends-decisions-framework)
- [State Management Architecture](./state-management-architecture.md)
