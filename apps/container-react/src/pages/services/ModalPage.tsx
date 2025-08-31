import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUI } from '@/contexts/UIContext';
import { TabGroup } from '@mfe/design-system-react';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { createLogger } from '@mfe-toolkit/core';

const logger = createLogger('ModalPage');

// MFE Card Component with Framework Badge (matching EventBusPageV3 style)
const MFECard: React.FC<{
  id: string;
  title: string;
  framework: 'react' | 'vue' | 'vanilla' | 'solid';
  frameworkVersion?: string;
  className?: string;
}> = ({ id, title, framework, frameworkVersion, className = '' }) => {
  const getFrameworkBadge = (framework: 'react' | 'vue' | 'vanilla' | 'solid') => {
    const badges = {
      react: { color: 'ds-bg-blue-500', icon: '⚛️', name: `React${frameworkVersion ? ` ${frameworkVersion}` : ''} MFE` },
      vue: { color: 'ds-bg-green-500', icon: '💚', name: 'Vue 3 MFE' },
      vanilla: { color: 'ds-bg-yellow-600', icon: '📦', name: 'Vanilla TS MFE' },
      solid: { color: 'ds-bg-purple-500', icon: '🔷', name: 'Solid.js MFE' }
    };
    return badges[framework];
  };

  const badge = getFrameworkBadge(framework);

  return (
    <div className={`ds-card ds-p-0 ${className}`}>
      <div className="ds-px-3 ds-py-2 ds-border-b ds-bg-slate-50 ds-flex ds-items-center ds-justify-between">
        <div className="ds-flex ds-items-center ds-gap-2">
          <span className="ds-text-sm ds-font-medium">{title}</span>
        </div>
        <div className={`ds-badge ds-badge-sm ${badge.color} ds-text-white`}>
          {badge.icon} {badge.name}
        </div>
      </div>
      <div>
        <RegistryMFELoader id={id} />
      </div>
    </div>
  );
};

export const ModalPage: React.FC = () => {
  const { openModal, closeModal } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab state - get initial tab from URL or default to 'container'
  const initialTab = searchParams.get('tab') || 'container';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [modalCount, setModalCount] = useState(0);
  const [customTitle, setCustomTitle] = useState('Custom Modal');
  const [customContent, setCustomContent] = useState('This is custom modal content from the container.');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  
  // Sync tab state with URL
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const showModal = (config: any) => {
    openModal(config);
    setModalCount(prev => prev + 1);
  };

  // Container modal content component
  const ContainerModalDemo = () => {
    const showSimpleModal = () => {
      showModal({
        title: 'Simple Modal',
        content: <p>This is a simple modal with text content from the Container.</p>,
        showCloseButton: true
      });
    };

    const showConfirmModal = () => {
      showModal({
        title: 'Confirm Action',
        content: (
          <div>
            <p>Are you sure you want to proceed with this action?</p>
            <p className="ds-text-sm ds-text-muted ds-mt-2">This action cannot be undone.</p>
          </div>
        ),
        onConfirm: () => {
          logger.info('Modal confirmed');
          closeModal();
        },
        onClose: () => {
          logger.info('Modal cancelled');
        },
        showCloseButton: true
      });
    };

    const showAlertModal = () => {
      showModal({
        title: '⚠️ Warning',
        content: (
          <div>
            <p className="ds-text-warning">This is an important warning message!</p>
            <p className="ds-mt-2">Please review the following information carefully.</p>
            <ul className="ds-list-disc ds-list-inside ds-mt-2 ds-text-sm">
              <li>Your data will be processed</li>
              <li>Changes cannot be reverted</li>
              <li>Backup your data first</li>
            </ul>
          </div>
        ),
        showCloseButton: true,
        closeOnOverlayClick: false
      });
    };

    const showSizeModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
      showModal({
        title: `${size.toUpperCase()} Size Modal`,
        content: (
          <div>
            <p>This modal is displayed in <strong>{size}</strong> size.</p>
            <p className="ds-mt-2 ds-text-sm ds-text-muted">
              Modal sizes: sm (small), md (medium), lg (large), xl (extra large)
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
        showCloseButton: true,
        closeOnOverlayClick: true
      });
    };

    const showFormModal = () => {
      showModal({
        title: 'Contact Form',
        content: (
          <form className="ds-space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="ds-block ds-text-sm ds-font-medium ds-mb-1">Name</label>
              <input
                type="text"
                className="ds-input"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="ds-block ds-text-sm ds-font-medium ds-mb-1">Email</label>
              <input
                type="email"
                className="ds-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="ds-block ds-text-sm ds-font-medium ds-mb-1">Message</label>
              <textarea
                className="ds-textarea"
                rows={3}
                placeholder="Enter your message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
          </form>
        ),
        size: 'lg',
        onConfirm: () => {
          logger.info('Form submitted:', formData);
          closeModal();
        },
        showCloseButton: true
      });
    };

    const showRichContentModal = () => {
      showModal({
        title: 'Rich Content Modal',
        content: (
          <div className="ds-space-y-4">
            <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
              <h3 className="ds-font-semibold ds-mb-2">Feature Highlights</h3>
              <ul className="ds-list-disc ds-list-inside ds-text-sm">
                <li>Dynamic content support</li>
                <li>React components as content</li>
                <li>Custom styling with design system</li>
                <li>Interactive elements</li>
              </ul>
            </div>
            <div className="ds-grid ds-grid-cols-3 ds-gap-2">
              <div className="ds-card-compact ds-text-center">
                <div className="ds-text-2xl">📊</div>
                <div className="ds-text-xs">Analytics</div>
              </div>
              <div className="ds-card-compact ds-text-center">
                <div className="ds-text-2xl">🔧</div>
                <div className="ds-text-xs">Settings</div>
              </div>
              <div className="ds-card-compact ds-text-center">
                <div className="ds-text-2xl">📧</div>
                <div className="ds-text-xs">Messages</div>
              </div>
            </div>
            <div className="ds-flex ds-gap-2">
              <button className="ds-btn-primary ds-btn-sm">Learn More</button>
              <button className="ds-btn-outline ds-btn-sm">Documentation</button>
            </div>
          </div>
        ),
        size: 'lg',
        showCloseButton: true
      });
    };

    const showStackedModals = () => {
      showModal({
        title: 'First Modal',
        content: (
          <div>
            <p>This is the first modal. Click the button below to open another modal on top.</p>
            <button 
              className="ds-btn-primary ds-mt-3"
              onClick={() => {
                showModal({
                  title: 'Second Modal',
                  content: (
                    <div>
                      <p>This is the second modal, stacked on top of the first one.</p>
                      <p className="ds-text-sm ds-text-muted ds-mt-2">
                        Note: This demonstrates modal stacking capability.
                      </p>
                    </div>
                  ),
                  size: 'sm',
                  showCloseButton: true
                });
              }}
            >
              Open Second Modal
            </button>
          </div>
        ),
        size: 'md',
        showCloseButton: true
      });
    };

    const showNoOverlayCloseModal = () => {
      showModal({
        title: 'Modal with Disabled Overlay Click',
        content: (
          <div>
            <p>This modal cannot be closed by clicking the overlay.</p>
            <p className="ds-text-sm ds-text-muted ds-mt-2">
              You must use the close button or press ESC.
            </p>
          </div>
        ),
        showCloseButton: true,
        closeOnOverlayClick: false
      });
    };

    return (
      <div className="ds-p-4">
        <div className="ds-mb-6">
          <h2 className="ds-text-2xl ds-font-bold ds-mb-2">Container Modal Demo</h2>
          <p className="ds-text-gray-600">
            Framework: <span className="ds-font-medium">React 19.0.0</span> | 
            Pattern: <span className="ds-font-medium">Container Native</span>
          </p>
        </div>

        <div className="ds-space-y-4">
          {/* Modal Types */}
          <div>
            <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Modal Types</h3>
            <div className="ds-flex ds-flex-wrap ds-gap-2">
              <button onClick={showSimpleModal} className="ds-btn-primary">
                Simple Modal
              </button>
              <button onClick={showConfirmModal} className="ds-btn-success">
                Confirm Dialog
              </button>
              <button onClick={showAlertModal} className="ds-btn-warning">
                Alert Modal
              </button>
              <button onClick={showFormModal} className="ds-btn-secondary">
                Form Modal
              </button>
              <button onClick={showRichContentModal} className="ds-btn-outline">
                Rich Content
              </button>
            </div>
          </div>

          {/* Modal Sizes */}
          <div>
            <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Modal Sizes</h3>
            <div className="ds-flex ds-gap-2">
              <button onClick={() => showSizeModal('sm')} className="ds-btn-outline">
                Small
              </button>
              <button onClick={() => showSizeModal('md')} className="ds-btn-outline">
                Medium
              </button>
              <button onClick={() => showSizeModal('lg')} className="ds-btn-outline">
                Large
              </button>
              <button onClick={() => showSizeModal('xl')} className="ds-btn-outline">
                Extra Large
              </button>
            </div>
          </div>

          {/* Custom Modal */}
          <div>
            <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Custom Modal</h3>
            <div className="ds-space-y-3">
              <div>
                <label className="ds-block ds-text-sm ds-font-medium ds-mb-1">Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="ds-input"
                  placeholder="Enter modal title"
                />
              </div>
              <div>
                <label className="ds-block ds-text-sm ds-font-medium ds-mb-1">Content</label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="ds-textarea"
                  rows={3}
                  placeholder="Enter modal content"
                />
              </div>
              <div>
                <label className="ds-block ds-text-sm ds-font-medium ds-mb-1">Size</label>
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
              </div>
              <button onClick={showCustomModal} className="ds-btn-primary">
                Show Custom Modal
              </button>
            </div>
          </div>

          {/* Advanced Features */}
          <div>
            <h3 className="ds-text-lg ds-font-semibold ds-mb-3">Advanced Features</h3>
            <div className="ds-flex ds-gap-2">
              <button onClick={showStackedModals} className="ds-btn-secondary">
                Stacked Modals
              </button>
              <button onClick={showNoOverlayCloseModal} className="ds-btn-outline">
                No Overlay Close
              </button>
            </div>
          </div>
        </div>

        {/* Modal Counter */}
        <div className="ds-mt-6 ds-p-3 ds-bg-gray-50 ds-rounded">
          <p className="ds-text-sm ds-text-gray-600">
            Modals opened: <span className="ds-font-semibold">{modalCount}</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="ds-page">
      <div className="ds-section">
        <h1 className="ds-page-title">Modal Service</h1>
        <p className="ds-text-muted">Test the platform modal system across different frameworks</p>
      </div>

      <TabGroup
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={[
          {
            id: 'container',
            label: '🏠 Container',
            content: (
              <div className="ds-card ds-p-0">
                <div className="ds-px-3 ds-py-2 ds-border-b ds-bg-slate-50 ds-flex ds-items-center ds-justify-between">
                  <div className="ds-flex ds-items-center ds-gap-2">
                    <span className="ds-text-sm ds-font-medium">Modal Service Demo</span>
                  </div>
                  <div className="ds-badge ds-badge-sm ds-bg-slate-600 ds-text-white">
                    🏠 Container Implementation
                  </div>
                </div>
                <div>
                  <ContainerModalDemo />
                </div>
              </div>
            )
          },
          {
            id: 'react19',
            label: '⚛️ React 19',
            content: (
              <MFECard 
                id="mfe-modal-react19" 
                title="Modal Service Demo" 
                framework="react"
                frameworkVersion="19"
              />
            )
          },
          {
            id: 'react18',
            label: '⚛️ React 18',
            content: (
              <MFECard 
                id="mfe-modal-react18" 
                title="Modal Service Demo" 
                framework="react"
                frameworkVersion="18"
              />
            )
          },
          {
            id: 'react17',
            label: '⚛️ React 17',
            content: (
              <MFECard 
                id="mfe-modal-react17" 
                title="Modal Service Demo" 
                framework="react"
                frameworkVersion="17"
              />
            )
          },
          {
            id: 'vue3',
            label: '💚 Vue 3',
            content: (
              <MFECard 
                id="mfe-modal-vue3" 
                title="Modal Service Demo" 
                framework="vue"
              />
            )
          },
          {
            id: 'solidjs',
            label: '🔷 Solid.js',
            content: (
              <MFECard 
                id="mfe-modal-solidjs" 
                title="Modal Service Demo" 
                framework="solid"
              />
            )
          },
          {
            id: 'vanilla',
            label: '📦 Vanilla TS',
            content: (
              <MFECard 
                id="mfe-modal-vanilla" 
                title="Modal Service Demo" 
                framework="vanilla"
              />
            )
          }
        ]}
        defaultTab="container"
        className="ds-mt-4"
      />
    </div>
  );
};