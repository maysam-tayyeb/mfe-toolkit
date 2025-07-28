# MFE Made Easy - Microfrontend Monorepo

A complete microfrontend (MFE) architecture built with React 19, Redux Toolkit, and pnpm workspaces. This setup demonstrates dynamic MFE loading, shared services, and a development workflow for building scalable frontend applications.

## ✨ Key Features

- 🚀 **Dynamic MFE Loading** - Load microfrontends on-demand with ES modules
- 📡 **Inter-MFE Communication** - Real-time event bus for MFE-to-MFE messaging ([see guide](./docs/mfe-communication-guide.md))
- 🎯 **Shared Services** - Modal, notification, auth, and logging services
- 📦 **Optimized Bundles** - 96% smaller with import maps (576KB → 14KB)
- 🔄 **Cross-Version Support** - React 17 MFEs work seamlessly in React 19 container
- 🛠️ **Modern Tooling** - Vite, TypeScript, pnpm workspaces, and ESBuild

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm (will be installed automatically if not present)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mfe-made-easy

# Install dependencies
pnpm install

# Build shared packages (required first time)
pnpm -r build
```

## 🏃‍♂️ Running the Applications

### Option 1: Run Everything in Parallel (Recommended)

```bash
pnpm dev
```

This starts both the container app and MFE example simultaneously.

### Option 2: Run Individual Applications

#### Step 1: Start the Container App

```bash
pnpm dev:container
```

- **URL**: http://localhost:3000
- **Purpose**: Main shell application with navigation and MFE loading

#### Step 2: Start the Example MFE

```bash
pnpm dev:mfe
```

- **URL**: http://localhost:3001
- **Purpose**: Standalone MFE for development and UMD bundle serving

#### Step 3: Build MFE for Dynamic Loading

```bash
cd apps/mfe-example
pnpm build
cp dist/mfe-example.umd.js public/
```

## 🧪 Testing the MFE Integration

1. **Open the Container App**: http://localhost:3000
2. **Navigate through the app**:
   - Home page shows the platform overview
   - Dashboard page tests container services
   - MFE Communication page for inter-MFE messaging
3. **Load the Example MFE**:
   - Click "Example MFE" in navigation, or
   - Go directly to http://localhost:3000/mfe/example
4. **Test MFE Services**:
   - Click buttons to test modal service
   - Try notifications system
   - Test event bus communication
   - Check authentication integration
   - View logger output in console

### 📡 Testing Inter-MFE Communication

For a comprehensive guide on testing real-time communication between MFEs, see the [MFE Communication Guide](./docs/mfe-communication-guide.md).

## 📁 Project Structure

```
mfe-made-easy/
├── apps/
│   ├── container/              # Container app (port 3000)
│   │   ├── src/
│   │   │   ├── components/     # Navigation, Layout, UI components
│   │   │   ├── pages/          # Home, Dashboard
│   │   │   ├── store/          # Redux slices
│   │   │   └── services/       # MFE services implementation
│   │   └── package.json
│   └── mfe-example/            # Example MFE (port 3001)
│       ├── src/
│       │   ├── App.tsx         # Interactive demo component
│       │   └── main.tsx        # UMD export and dev mode
│       ├── dist/               # Built UMD files
│       ├── public/             # Static assets and UMD copy
│       └── package.json
├── packages/
│   ├── mfe-dev-kit/            # Core MFE toolkit
│   │   └── src/
│   │       ├── types/          # TypeScript definitions
│   │       ├── services/       # Logger, EventBus, Registry
│   │       └── components/     # MFELoader, MFEPage
│   └── shared/                 # Common utilities
│       └── src/
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root package with scripts
```

## 🛠️ Available Scripts

- `pnpm dev` - Start all apps in parallel
- `pnpm dev:container` - Start only container app
- `pnpm dev:mfe` - Start only example MFE
- `pnpm build` - Build all packages
- `pnpm -r build` - Build packages in dependency order
- `pnpm type-check` - TypeScript checking

## 🔧 Development Workflow

### Building New MFEs

1. Create new app in `apps/` directory
2. Configure Vite for UMD build
3. Implement MFE module interface
4. Register in container's MFE registry
5. Build and copy UMD to public directory

### Key Configuration Files

- `pnpm-workspace.yaml` - Workspace setup
- `tsconfig.base.json` - Shared TypeScript config
- `vite.config.base.ts` - Shared Vite configuration
- `tailwind.config.base.js` - Shared Tailwind setup

## 🎯 Features Implemented

✅ **Monorepo Setup**: pnpm workspaces with shared configurations  
✅ **Container App**: React 19 + Redux Toolkit + ShadCN UI  
✅ **MFE Dev Kit**: Complete service layer for MFE integration  
✅ **Dynamic Loading**: UMD modules loaded at runtime  
✅ **Shared Services**: Auth, Modal, Notification, Event Bus, Logger  
✅ **Development Mode**: Hot reload for both container and MFEs  
✅ **TypeScript**: Full type safety across the monorepo  
✅ **Modern Tooling**: Vite, Tailwind CSS, ESLint support

## 🐛 Troubleshooting

### MFE Not Loading

1. Ensure MFE is built: `cd apps/mfe-example && pnpm build`
2. Copy UMD to public: `cp dist/mfe-example.umd.js public/`
3. Check if UMD is accessible: http://localhost:3001/mfe-example.umd.js
4. Verify both container and MFE servers are running

### Build Errors

1. Build packages first: `pnpm -r build`
2. Clear node_modules: `rm -rf node_modules && pnpm install`
3. Check TypeScript errors: `pnpm type-check`

### Port Conflicts

- Container app uses port 3000
- Example MFE uses port 3001
- Modify ports in respective `vite.config.ts` files if needed

## 📚 Documentation

### Guides
- **[MFE Communication Guide](./docs/mfe-communication-guide.md)** - Learn how to implement inter-MFE communication with real-time event bus examples

### API Reference
- **[MFE Development Kit](./packages/mfe-dev-kit/README.md)** - Core services and utilities for MFE development
- **[Shared Utilities](./packages/shared/README.md)** - Common constants and helper functions

## 🚀 Next Steps

- Add more MFE examples
- Implement routing between MFEs
- Add testing setup with Vitest
- Configure CI/CD pipeline
- Add error boundaries and fallbacks
- Implement MFE-specific state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
