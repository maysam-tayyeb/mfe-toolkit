import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [modalCount, setModalCount] = useState(0);
  const [customTitle, setCustomTitle] = useState('Custom Modal');
  const [customContent, setCustomContent] = useState('This is custom modal content from React 17.');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  const showModal = (config: any) => {
    if (!services.modal) {
      console.error('Modal service not available');
      return;
    }
    services.modal.show(config);
    setModalCount(prev => prev + 1);
  };

  const showSimpleModal = () => {
    showModal({
      title: 'React 17 Modal',
      content: <p>This modal is powered by React 17 - the stable legacy version!</p>,
      showCloseButton: true
    });
  };

  const showConfirmModal = () => {
    showModal({
      title: 'Confirm Action',
      content: (
        <div>
          <p>Are you sure you want to proceed?</p>
          <p className="ds-text-sm ds-text-muted ds-mt-2">
            Triggered from React 17 MFE
          </p>
        </div>
      ),
      onConfirm: () => {
        console.log('Confirmed from React 17!');
        services.modal?.close();
        services.notification?.show({
          title: 'Success',
          message: 'Action confirmed!',
          type: 'success'
        });
      },
      showCloseButton: true
    });
  };

  const showSizeModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    showModal({
      title: `${size.toUpperCase()} Modal`,
      content: (
        <div>
          <p>This is a <strong>${size}</strong> modal.</p>
          <p className="ds-text-sm ds-text-muted ds-mt-2">
            React 17 with legacy render API
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

  const showFeatureModal = () => {
    showModal({
      title: 'React 17 Features',
      content: (
        <div className="ds-space-y-4">
          <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
            <h3 className="ds-font-semibold ds-mb-2">Version Features</h3>
            <ul className="ds-list-disc ds-list-inside ds-text-sm">
              <li>Legacy ReactDOM.render API</li>
              <li>Class components support</li>
              <li>Stable and widely supported</li>
              <li>Compatible with older codebases</li>
            </ul>
          </div>
          <div className="ds-grid ds-grid-cols-3 ds-gap-2">
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">🔗</div>
              <div className="ds-text-xs">Legacy</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">⚛️</div>
              <div className="ds-text-xs">React 17</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">✅</div>
              <div className="ds-text-xs">Stable</div>
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
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔗 React 17 Modal Demo
        </h1>
        <p className="ds-text-gray-600">
          Legacy React with ReactDOM.render API
        </p>
      </div>

      <div className="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl ds-font-bold ds-text-accent-primary">{modalCount}</div>
          <div className="ds-text-sm ds-text-gray-600">Modals Opened</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚛️</div>
          <div className="ds-text-sm ds-text-gray-600">React 17</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">🔗</div>
          <div className="ds-text-sm ds-text-gray-600">Legacy API</div>
        </div>
      </div>

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
            <button onClick={showFeatureModal} className="ds-btn-secondary">
              Features
            </button>
          </div>
        </div>

        <div>
          <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Modal Sizes</h3>
          <div className="ds-flex ds-gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
              <button 
                key={size}
                onClick={() => showSizeModal(size)} 
                className="ds-btn-outline ds-btn-sm"
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

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

      <div className="ds-mt-6 ds-pt-4 ds-border-t ds-text-center ds-text-sm ds-text-gray-500">
        React 17 Modal Service Demo • Legacy Stable Version
      </div>
    </div>
  );
};