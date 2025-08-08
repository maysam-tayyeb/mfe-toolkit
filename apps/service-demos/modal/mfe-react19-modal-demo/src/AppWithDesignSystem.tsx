import React, { useState, useEffect } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

// Type for design system tokens (if loaded)
type DesignTokens = {
  patterns: Record<string, Record<string, string>>;
  classNames: Record<string, string>;
  version: string;
};

interface AppProps {
  services: MFEServices;
}

/**
 * Modal Demo with Design System Integration
 * Shows how to use the design system without global pollution:
 * 1. CSS classes are available via container's stylesheet (no JS needed)
 * 2. Optional: Import ES module for programmatic token access
 */
function AppWithDesignSystem({ services }: AppProps) {
  const [designTokens, setDesignTokens] = useState<DesignTokens | null>(null);
  const { modal, notification } = services;

  // Optional: Load design tokens for programmatic use
  // This is NOT required - CSS classes work without this
  useEffect(() => {
    // Explicitly import design system ES module - no global access
    import('http://localhost:8080/design-system/design-system.esm.js')
      .then((module) => {
        setDesignTokens(module as DesignTokens);
        console.log('Design system tokens loaded:', module.version);
      })
      .catch(() => {
        console.log('Design tokens not available - using CSS classes only');
      });
  }, []);

  const handleSimpleAlert = () => {
    modal.open({
      title: 'Simple Alert',
      content: 'This modal uses the design system CSS classes (ds-* prefix)',
      onClose: () => {
        notification.info('Alert Closed', 'The simple alert was dismissed');
      },
    });
  };

  const handleConfirmation = () => {
    modal.open({
      title: 'Confirm Action',
      content: 'This demo shows how MFEs can use design system without global pollution',
      onConfirm: () => {
        notification.success('Confirmed', 'Action was confirmed successfully');
      },
      onClose: () => {
        notification.warning('Cancelled', 'Action was cancelled');
      },
    });
  };

  const handleFormModal = () => {
    const formContent = (
      <div className="ds-stack">
        <div className="ds-form-group">
          <label className="ds-label">Name</label>
          <input type="text" placeholder="Enter your name" className="ds-input" />
        </div>
        <div className="ds-form-group">
          <label className="ds-label">Email</label>
          <input type="email" placeholder="Enter your email" className="ds-input" />
        </div>
      </div>
    );

    modal.open({
      title: 'User Form with Design System',
      content: formContent,
      onConfirm: () => {
        notification.success('Form Submitted', 'Your information was saved');
      },
      onClose: () => {
        // Form cancelled - no action needed
      },
    });
  };

  const handleCustomContent = () => {
    const customContent = (
      <div className="text-center ds-stack">
        <div className="text-5xl mb-4">🎨</div>
        <h3 className="ds-h3">Design System Integration</h3>
        <p className="ds-text-muted ds-text-small">This modal demonstrates design system usage</p>
        <ul className="text-left max-w-sm mx-auto ds-list">
          <li className="ds-list-item">
            <span className="text-green-500">✓</span>
            <span>CSS classes via container stylesheet</span>
          </li>
          <li className="ds-list-item">
            <span className="text-green-500">✓</span>
            <span>Optional ES module for tokens</span>
          </li>
          <li className="ds-list-item">
            <span className="text-green-500">✓</span>
            <span>No global pollution</span>
          </li>
        </ul>
      </div>
    );

    modal.open({
      title: 'Design System Features',
      content: customContent,
      size: 'lg',
    });
  };

  return (
    <div className="ds-stack-lg p-6">
      {/* Main Demo Card */}
      <div className="ds-card-padded ds-card-elevated">
        <h3 className="ds-h3">React 19 Modal Demo</h3>
        <p className="ds-text-muted ds-text-small mb-4">
          Using Design System - No Global Pollution
        </p>

        {/* Status Indicators */}
        <div className="ds-stack-sm mb-4">
          <div className="ds-alert-info text-xs">
            ✅ CSS Classes: Available via container stylesheet
          </div>
          {designTokens && (
            <div className="ds-alert-success text-xs">
              ✅ Design Tokens: Loaded (v{designTokens.version})
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="ds-stack-sm">
          <p className="ds-label">Test Modal Service:</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleSimpleAlert} className="ds-button-outline">
              Simple Alert
            </button>
            <button onClick={handleConfirmation} className="ds-button-outline">
              Confirmation
            </button>
            <button onClick={handleFormModal} className="ds-button-primary">
              Form Modal
            </button>
            <button onClick={handleCustomContent} className="ds-button-primary">
              Custom Content
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="ds-card-compact">
        <p className="ds-label mb-2">Design System Usage</p>
        <ul className="ds-list ds-text-xs text-gray-600">
          <li>• CSS classes use `ds-` prefix (e.g., ds-card, ds-button)</li>
          <li>• Classes loaded from container's stylesheet</li>
          <li>• Optional ES module import for token access</li>
          <li>• No window/global variables used</li>
          <li>• Framework-agnostic approach</li>
        </ul>

        {designTokens && (
          <div className="mt-4 p-2 bg-gray-100 rounded ds-text-xs">
            <strong>Available Patterns:</strong>
            <pre className="mt-1 text-gray-600">
              {JSON.stringify(Object.keys(designTokens.patterns), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppWithDesignSystem;
