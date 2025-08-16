export interface ReactTemplateConfig {
  name: string;
  reactVersion: string;
  projectPath: string;
  isModal?: boolean;
}

export function getReactMainTemplate(config: ReactTemplateConfig): string {
  const { name, reactVersion, projectPath } = config;
  const isNotification = projectPath.includes('notification');
  const isModal = projectPath.includes('modal');
  
  const importStatement = reactVersion === '17'
    ? `import ReactDOM from 'react-dom';`
    : `import ReactDOM from 'react-dom/client';`;

  const requiredServices = isModal 
    ? "['modal']"
    : isNotification 
      ? "['notification']" 
      : "['logger']";
  
  const capabilities = isModal
    ? "['modal-demo']"
    : isNotification
      ? "['notification-demo']"
      : "['demo']";

  return `import React from 'react';
${importStatement}
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let root: ${reactVersion === '17' ? 'HTMLElement | null' : 'ReactDOM.Root | null'} = null;

const module: MFEModule = {
  metadata: {
    name: '${name}',
    version: '1.0.0',
    requiredServices: ${requiredServices},
    capabilities: ${capabilities}
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    ${
      reactVersion === '17'
        ? `root = element;
    ReactDOM.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>,
      element
    );`
        : `root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );`
    }
    
    if (services.logger) {
      services.logger.info('[${name}] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (root) {
      ${reactVersion === '17' ? `ReactDOM.unmountComponentAtNode(root);` : `root.unmount();`}
      root = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[${name}] Unmounted successfully');
    }
  }
};

export default module;`;
}

export function getReactAppTemplate(config: ReactTemplateConfig): string {
  const { name, reactVersion } = config;
  const isModal = config.isModal || config.projectPath.includes('modal');
  
  if (isModal) {
    return `import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [modalCount, setModalCount] = useState(0);
  const [customTitle, setCustomTitle] = useState('Custom Modal');
  const [customContent, setCustomContent] = useState('This is custom modal content.');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  const showModal = (config: any) => {
    services.modal?.show(config);
    setModalCount(prev => prev + 1);
  };

  const showSimpleModal = () => {
    showModal({
      title: 'Simple Modal from ${name}',
      content: <p>This is a simple modal from the MFE!</p>,
      showCloseButton: true
    });
  };

  const showConfirmModal = () => {
    showModal({
      title: 'Confirm Action',
      content: (
        <div>
          <p>Are you sure you want to proceed?</p>
          <p className="ds-text-sm ds-text-muted ds-mt-2">This action cannot be undone.</p>
        </div>
      ),
      onConfirm: () => {
        console.log('Confirmed from ${name}!');
        services.modal?.close();
        services.notification?.show({
          title: 'Confirmed',
          message: 'Action confirmed successfully',
          type: 'success'
        });
      },
      onClose: () => {
        console.log('Cancelled from ${name}');
      },
      showCloseButton: true
    });
  };

  const showSizeModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    showModal({
      title: \`\${size.toUpperCase()} Modal from MFE\`,
      content: (
        <div>
          <p>This modal is <strong>\${size}</strong> size.</p>
          <p className="ds-text-sm ds-text-muted ds-mt-2">
            Triggered from React ${reactVersion} MFE
          </p>
        </div>
      ),
      size,
      showCloseButton: true
    });
  };

  const showCustomModal = () => {
    showModal({
      title: customTitle,
      content: <p>{customContent}</p>,
      size: selectedSize,
      showCloseButton: true
    });
  };

  const showRichModal = () => {
    showModal({
      title: 'Rich Content Modal',
      content: (
        <div className="ds-space-y-4">
          <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
            <h3 className="ds-font-semibold ds-mb-2">MFE Features</h3>
            <ul className="ds-list-disc ds-list-inside ds-text-sm">
              <li>React ${reactVersion} Framework</li>
              <li>Modal Service Integration</li>
              <li>Design System Support</li>
              <li>Cross-MFE Communication</li>
            </ul>
          </div>
          <div className="ds-grid ds-grid-cols-3 ds-gap-2">
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">⚛️</div>
              <div className="ds-text-xs">React</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">🪟</div>
              <div className="ds-text-xs">Modals</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">🎨</div>
              <div className="ds-text-xs">Styled</div>
            </div>
          </div>
        </div>
      ),
      size: 'lg',
      showCloseButton: true
    });
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      {/* Header Section */}
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🪟 ${name}
        </h1>
        <p className="ds-text-gray-600">
          React ${reactVersion} Modal Service Demo
        </p>
      </div>

      {/* Stats Section */}
      <div className="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl ds-font-bold ds-text-accent-primary">{modalCount}</div>
          <div className="ds-text-sm ds-text-gray-600">Modals Opened</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚛️</div>
          <div className="ds-text-sm ds-text-gray-600">React ${reactVersion}</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">🚀</div>
          <div className="ds-text-sm ds-text-gray-600">Ready</div>
        </div>
      </div>

      {/* Modal Types */}
      <div className="ds-space-y-4">
        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Modal Types</h3>
          <div className="ds-flex ds-flex-wrap ds-gap-2">
            <button onClick={showSimpleModal} className="ds-btn-primary">
              Simple Modal
            </button>
            <button onClick={showConfirmModal} className="ds-btn-success">
              Confirm Dialog
            </button>
            <button onClick={showRichModal} className="ds-btn-secondary">
              Rich Content
            </button>
          </div>
        </div>

        {/* Modal Sizes */}
        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Modal Sizes</h3>
          <div className="ds-flex ds-gap-2">
            <button onClick={() => showSizeModal('sm')} className="ds-btn-outline ds-btn-sm">
              Small
            </button>
            <button onClick={() => showSizeModal('md')} className="ds-btn-outline ds-btn-sm">
              Medium
            </button>
            <button onClick={() => showSizeModal('lg')} className="ds-btn-outline ds-btn-sm">
              Large
            </button>
            <button onClick={() => showSizeModal('xl')} className="ds-btn-outline ds-btn-sm">
              XL
            </button>
          </div>
        </div>

        {/* Custom Modal */}
        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Custom Modal</h3>
          <div className="ds-space-y-3">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="ds-input"
              placeholder="Modal title"
            />
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="ds-textarea"
              rows={2}
              placeholder="Modal content"
            />
            <select 
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value as any)}
              className="ds-select"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
            <button onClick={showCustomModal} className="ds-btn-primary">
              Show Custom Modal
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="ds-mt-6 ds-pt-4 ds-border-t ds-text-center ds-text-sm ds-text-gray-500">
        Modal Service Demo • React ${reactVersion} MFE
      </div>
    </div>
  );
};`;
  }

  // Default template for non-modal MFEs
  return `import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to your new MFE!');

  const handleNotification = (type: 'success' | 'info' | 'warning' | 'error') => {
    services.notification?.show({
      title: \`\${type.charAt(0).toUpperCase() + type.slice(1)} Notification\`,
      message: \`This is a \${type} notification from ${name}\`,
      type
    });
  };

  const handleLog = () => {
    services.logger?.info(\`[${name}] Count is currently \${count}\`);
    setMessage(\`Logged count: \${count}\`);
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      {/* Header Section */}
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🎉 ${name}
        </h1>
        <p className="ds-text-gray-600">
          Built with React ${reactVersion} and MFE Toolkit
        </p>
      </div>

      {/* Stats Section */}
      <div className="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl ds-font-bold ds-text-accent-primary">{count}</div>
          <div className="ds-text-sm ds-text-gray-600">Counter</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚛️</div>
          <div className="ds-text-sm ds-text-gray-600">React ${reactVersion}</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">🚀</div>
          <div className="ds-text-sm ds-text-gray-600">Ready</div>
        </div>
      </div>

      {/* Message Display */}
      <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded ds-mb-6">
        <p className="ds-text-sm">{message}</p>
      </div>

      {/* Interactive Section */}
      <div className="ds-space-y-4">
        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Counter Demo</h3>
          <div className="ds-flex ds-gap-2">
            <button 
              onClick={() => setCount(c => c + 1)}
              className="ds-btn-primary"
            >
              Increment
            </button>
            <button 
              onClick={() => setCount(0)}
              className="ds-btn-outline"
            >
              Reset
            </button>
            <button 
              onClick={handleLog}
              className="ds-btn-secondary"
            >
              Log Count
            </button>
          </div>
        </div>

        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Notification Demo</h3>
          <div className="ds-flex ds-flex-wrap ds-gap-2">
            <button 
              onClick={() => handleNotification('success')}
              className="ds-btn-success ds-btn-sm"
            >
              Success
            </button>
            <button 
              onClick={() => handleNotification('info')}
              className="ds-btn-primary ds-btn-sm"
            >
              Info
            </button>
            <button 
              onClick={() => handleNotification('warning')}
              className="ds-btn-warning ds-btn-sm"
            >
              Warning
            </button>
            <button 
              onClick={() => handleNotification('error')}
              className="ds-btn-danger ds-btn-sm"
            >
              Error
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="ds-mt-6 ds-pt-4 ds-border-t ds-text-center ds-text-sm ds-text-gray-500">
        Created with ❤️ by MFE Toolkit CLI
      </div>
    </div>
  );
};`;
}