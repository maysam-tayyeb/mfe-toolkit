# Outdated Documentation Audit

After simplifying the service architecture, the following documentation needs updates:

## 🔴 Critical Updates Needed

### 1. `/docs/CONTAINER_SETUP_GUIDE.md`
**Issues:**
- References deleted `mfe-services.ts` file (line 64, 134, 136)
- Shows old service creation pattern with singleton (lines 136-231)
- References `mfe-services-singleton.ts` which no longer exists (line 236)
- Outdated import from `../services/mfe-services` (line 243)

**Required Changes:**
- Update to use new `service-container.ts`
- Show new simplified service initialization
- Remove singleton pattern references
- Update import paths

### 2. `/docs/architecture/state-management-architecture.md`
**Issues:**
- Still describes old ContextBridge architecture with complex proxy pattern
- Doesn't mention the simplified service container
- Architecture diagram shows outdated service flow

**Required Changes:**
- Update ContextBridge section to reflect simplified implementation
- Add section about new UnifiedServiceContainer
- Update architecture diagram

## 🟡 Minor Updates Needed

### 3. `/docs/architecture/README.md`
**Issues:**
- ContextBridge description might need updating (line 98)
- Should reference the new service-architecture-simplified.md document

**Required Changes:**
- Add link to service-architecture-simplified.md
- Update ContextBridge description if needed

### 4. `/docs/architecture/architecture-decisions.md`
**Issues:**
- May need to add decision record about removing proxy pattern
- Should document why we simplified the service architecture

**Required Changes:**
- Add new ADR for service simplification

### 5. `/docs/examples/service-registry-examples.md`
**Issues:**
- Contains Proxy examples that might confuse users (lines 287, 702, 740, 786)
- These are in example code but might lead to wrong patterns

**Required Changes:**
- Consider adding note that we don't use Proxy pattern in core architecture
- Or update examples to show direct service pattern

### 6. `/docs/architecture/service-registry-architecture.md`
**Issues:**
- Contains Proxy pattern example (line 437)
- May reference old service structure

**Required Changes:**
- Update to reflect simplified architecture
- Remove or update Proxy examples

## ✅ Already Updated

### Documents Created:
- `/docs/architecture/service-architecture-simplified.md` - Complete documentation of new architecture
- `/CONTAINER_AUDIT_PLAN.md` - Audit results and improvement plan

## 📝 Recommended Actions

1. **Immediate Priority:**
   - Update CONTAINER_SETUP_GUIDE.md as it's a primary onboarding document
   - Update state-management-architecture.md to reflect current implementation

2. **Secondary Priority:**
   - Add ADR for service simplification decision
   - Update architecture README to reference new docs

3. **Nice to Have:**
   - Review and update example code to avoid confusion
   - Add migration guide from old to new service architecture

## Migration Examples

### Old Pattern (to be removed from docs):
```typescript
// mfe-services.ts
import { createSharedServices } from './mfe-services';
const services = getSharedServices();
```

### New Pattern (to be documented):
```typescript
// service-container.ts
import { createServiceContainer } from './service-container';
const serviceContainer = useMemo(() => createServiceContainer(), []);
```

## Files to Delete References To:
- `container-services.ts`
- `shared-services.ts`
- `mfe-services.ts` (the old one with proxy pattern)
- `mfe-services-singleton.ts`

## New Files to Document:
- `service-container.ts`
- Simplified `context-bridge.tsx`