import React, { useState, useTransition } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [modalCount, setModalCount] = useState(0);
  const [customTitle, setCustomTitle] = useState('Custom Modal');
  const [customContent, setCustomContent] = useState('This is custom modal content from React 18.');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isPending, startTransition] = useTransition();

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
      title: 'React 18 Modal',
      content: <p>This modal is powered by React 18 with concurrent features!</p>,
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
            Triggered from React 18 MFE with Concurrent Mode
          </p>
        </div>
      ),
      onConfirm: () => {
        console.log('Confirmed from React 18!');
        services.modal?.close();
        startTransition(() => {
          services.notification?.show({
            title: 'Success',
            message: 'Action confirmed with React 18 transitions!',
            type: 'success'
          });
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
            React 18 with createRoot API
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
      title: 'React 18 Features',
      content: (
        <div className="ds-space-y-4">
          <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
            <h3 className="ds-font-semibold ds-mb-2">Concurrent Features</h3>
            <ul className="ds-list-disc ds-list-inside ds-text-sm">
              <li>Automatic batching of updates</li>
              <li>Concurrent rendering with createRoot</li>
              <li>useTransition for non-urgent updates</li>
              <li>Suspense improvements</li>
              <li>Strict Mode enhancements</li>
            </ul>
          </div>
          <div className="ds-grid ds-grid-cols-3 ds-gap-2">
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">⚡</div>
              <div className="ds-text-xs">Concurrent</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">⚛️</div>
              <div className="ds-text-xs">React 18</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">🚀</div>
              <div className="ds-text-xs">Modern</div>
            </div>
          </div>
        </div>
      ),
      size: 'lg',
      showCloseButton: true
    });
  };

  const showTransitionModal = () => {
    startTransition(() => {
      showModal({
        title: 'Transition Modal',
        content: (
          <div>
            <p>This modal was opened using React 18's useTransition!</p>
            <p className="ds-text-sm ds-text-muted ds-mt-2">
              Non-urgent updates are deferred for better performance
            </p>
          </div>
        ),
        showCloseButton: true
      });
    });
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          ⚛️ React 18 Modal Demo
        </h1>
        <p className="ds-text-gray-600">
          Modern React with Concurrent Features
        </p>
        {isPending && (
          <p className="ds-text-sm ds-text-warning ds-mt-2">
            Transition pending...
          </p>
        )}
      </div>

      <div className="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl ds-font-bold ds-text-accent-primary">{modalCount}</div>
          <div className="ds-text-sm ds-text-gray-600">Modals Opened</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚛️</div>
          <div className="ds-text-sm ds-text-gray-600">React 18</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚡</div>
          <div className="ds-text-sm ds-text-gray-600">Concurrent</div>
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
            <button onClick={showTransitionModal} className="ds-btn-warning">
              With Transition
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
        React 18 Modal Service Demo • Concurrent Features Enabled
      </div>
    </div>
  );
};