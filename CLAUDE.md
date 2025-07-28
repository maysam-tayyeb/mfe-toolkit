# MFE Monorepo Setup Instructions for Claude Code

## 🔄 IMPORTANT: Development Workflow

When working on any task in this codebase, ALWAYS follow this workflow:

1. **📊 ANALYZE** - First understand the current state
   - Read relevant files and existing tests
   - Search for related code
   - Understand dependencies and impacts
   - Review test coverage reports

2. **📝 PLAN** - Present a clear plan before making changes
   - List specific files to be modified
   - Describe the changes to be made
   - Identify potential impacts
   - Consider what tests will be needed

3. **⚡ IMPLEMENT** - Build the feature
   - Write clean, maintainable code
   - Follow existing patterns and conventions
   - Ensure proper error handling
   - Add appropriate logging
   - **Run `pnpm type-check` frequently** to catch TypeScript errors early
   - **Run `pnpm lint` periodically** to maintain code quality

4. **🧪 TEST** - Ensure comprehensive test coverage
   - Write unit tests for new functionality
   - Write integration tests for component interactions
   - Update E2E tests if user-facing behavior changes
   - **Run `pnpm test` after writing tests** to ensure they pass
   - **Run `pnpm test:coverage`** to verify coverage meets requirements (>80%)

5. **♻️ REFACTOR** - Improve code quality
   - Refactor implementation while keeping tests green
   - Improve code readability and maintainability
   - **Run `pnpm test` after each refactor** to ensure no regression
   - **Run `pnpm lint` and `pnpm type-check`** to maintain quality

6. **✅ QUALITY CHECK** - Before review, always run:
   - `pnpm test` - Run all unit and integration tests
   - `pnpm test:coverage` - Ensure test coverage meets requirements (>80%)
   - `pnpm e2e` - Run E2E tests with Playwright
   - `pnpm format` - Format code with Prettier
   - `pnpm lint` - Check code with ESLint
   - `pnpm type-check` - Verify TypeScript types and compilation
   - `pnpm build` - Ensure code compiles without errors after linting

7. **⏸️ WAIT FOR REVIEW** - DO NOT commit or push
   - Present the completed changes with passing tests
   - Show test coverage reports
   - Show results of all quality checks
   - Wait for user review and approval
   - Only commit/push when explicitly asked

## Project Overview

This is a monorepo using pnpm workspaces for a microfrontend (MFE) architecture with a container app that dynamically loads MFEs. The container app shares React 19, Redux Toolkit, TailwindCSS, and ShadCN components with MFEs to reduce bundle sizes.

## Development Notes

- **Rebuild if updated**: Always rebuild the project when making changes to core configurations or dependencies to ensure consistency across the monorepo.

[Rest of the existing content remains unchanged]