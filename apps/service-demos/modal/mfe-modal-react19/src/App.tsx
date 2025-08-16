import React, { useState, useTransition, useOptimistic, use } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [modalCount, setModalCount] = useState(0);
  const [optimisticModalCount, setOptimisticModalCount] = useOptimistic(modalCount);
  const [customTitle, setCustomTitle] = useState('Custom Modal');
  const [customContent, setCustomContent] = useState('This is custom modal content from React 19.');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isPending, startTransition] = useTransition();

  const showModal = (config: any) => {
    if (!services.modal) {
      console.error('Modal service not available');
      return;
    }
    
    setOptimisticModalCount(modalCount + 1);
    services.modal.show(config);
    setModalCount(prev => prev + 1);
  };

  const showSimpleModal = () => {
    showModal({
      title: 'React 19 Modal',
      content: <p>This modal is powered by React 19 - the latest and greatest!</p>,
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
            Triggered from React 19 MFE with Server Components support
          </p>
        </div>
      ),
      onConfirm: () => {
        console.log('Confirmed from React 19!');
        services.modal?.close();
        startTransition(() => {
          services.notification?.show({
            title: 'Success',
            message: 'Action confirmed with React 19 optimistic updates!',
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
            React 19 with enhanced performance
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
      title: 'React 19 Features',
      content: (
        <div className="ds-space-y-4">
          <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
            <h3 className="ds-font-semibold ds-mb-2">Cutting-Edge Features</h3>
            <ul className="ds-list-disc ds-list-inside ds-text-sm">
              <li>Server Components support</li>
              <li>use() hook for promises</li>
              <li>useOptimistic for optimistic UI</li>
              <li>Enhanced Suspense capabilities</li>
              <li>Actions and form handling</li>
              <li>Improved hydration</li>
            </ul>
          </div>
          <div className="ds-grid ds-grid-cols-3 ds-gap-2">
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">🔥</div>
              <div className="ds-text-xs">Latest</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">⚛️</div>
              <div className="ds-text-xs">React 19</div>
            </div>
            <div className="ds-card-compact ds-text-center">
              <div className="ds-text-2xl">🚀</div>
              <div className="ds-text-xs">Advanced</div>
            </div>
          </div>
        </div>
      ),
      size: 'lg',
      showCloseButton: true
    });
  };

  const showOptimisticModal = () => {
    startTransition(() => {
      showModal({
        title: 'Optimistic Update Modal',
        content: (
          <div>
            <p>This modal uses React 19's useOptimistic hook!</p>
            <p className="ds-text-sm ds-text-muted ds-mt-2">
              The counter updated immediately (optimistically) while the modal loads
            </p>
            <div className="ds-mt-3 ds-p-2 ds-bg-accent-success-soft ds-rounded">
              <p className="ds-text-sm">
                Counter showed: {optimisticModalCount} (optimistic)
              </p>
              <p className="ds-text-sm">
                Actual count: {modalCount}
              </p>
            </div>
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
          🔥 React 19 Modal Demo
        </h1>
        <p className="ds-text-gray-600">
          Latest React with Server Components Ready
        </p>
        {isPending && (
          <p className="ds-text-sm ds-text-warning ds-mt-2">
            Transition pending...
          </p>
        )}
      </div>

      <div className="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl ds-font-bold ds-text-accent-primary">
            {optimisticModalCount}
          </div>
          <div className="ds-text-sm ds-text-gray-600">Modals Opened</div>
          {optimisticModalCount !== modalCount && (
            <div className="ds-text-xs ds-text-warning">(updating...)</div>
          )}
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">⚛️</div>
          <div className="ds-text-sm ds-text-gray-600">React 19</div>
        </div>
        <div className="ds-card-compact ds-text-center">
          <div className="ds-text-2xl">🔥</div>
          <div className="ds-text-sm ds-text-gray-600">Latest</div>
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
            <button onClick={showOptimisticModal} className="ds-btn-warning">
              Optimistic UI
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
        React 19 Modal Service Demo • Latest Features & Optimistic UI
      </div>
    </div>
  );
};