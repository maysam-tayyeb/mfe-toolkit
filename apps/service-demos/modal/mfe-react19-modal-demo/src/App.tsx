import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

function App({ services }: AppProps) {
  const [events, setEvents] = useState<string[]>([]);
  const { modal, notification } = services;

  const addEvent = (event: string) => {
    setEvents((prev) => [...prev.slice(-4), event]);
  };

  const handleSimpleAlert = () => {
    addEvent('Opening simple alert');
    modal.open({
      title: 'Simple Alert',
      content: 'This is a simple alert modal with just an OK button.',
      onClose: () => {
        addEvent('Simple alert closed');
        notification.info('Alert Closed', 'The simple alert was dismissed');
      },
    });
  };

  const handleConfirmation = () => {
    addEvent('Opening confirmation dialog');
    modal.open({
      title: 'Confirm Action',
      content: 'Are you sure you want to proceed with this action?',
      onConfirm: () => {
        addEvent('Action confirmed');
        notification.success('Confirmed', 'Action was confirmed successfully');
      },
      onClose: () => {
        addEvent('Action cancelled');
        notification.warning('Cancelled', 'Action was cancelled');
      },
    });
  };

  const handleFormModal = () => {
    addEvent('Opening form modal');
    const formContent = (
      <div className="space-y-4">
        <div>
          <label className="ds-label">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            className="ds-input"
          />
        </div>
        <div>
          <label className="ds-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="ds-input"
          />
        </div>
      </div>
    );

    modal.open({
      title: 'User Form',
      content: formContent,
      onConfirm: () => {
        addEvent('Form submitted');
        notification.success('Form Submitted', 'Your information was saved');
      },
      onClose: () => {
        addEvent('Form cancelled');
      },
    });
  };

  const handleCustomContent = () => {
    addEvent('Opening custom content modal');
    const customContent = (
      <div className="text-center space-y-4">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold">Welcome to Modal Service!</h3>
        <p className="ds-text-small ds-text-muted">
          This modal demonstrates custom React content.
        </p>
        <ul className="text-left max-w-sm mx-auto space-y-2 ds-text-small">
          <li className="flex items-center gap-2">
            <span className="ds-icon-success">✓</span>
            <span>Rich content support</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="ds-icon-success">✓</span>
            <span>React components</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="ds-icon-success">✓</span>
            <span>Interactive elements</span>
          </li>
        </ul>
      </div>
    );

    modal.open({
      title: 'Custom Content Modal',
      content: customContent,
      onClose: () => {
        addEvent('Custom modal closed');
        notification.success('Nice!', 'You explored the custom content modal');
      },
    });
  };

  const handleErrorDemo = () => {
    addEvent('Triggering error notification');
    notification.error('Error Example', 'This is what an error notification looks like');

    setTimeout(() => {
      modal.open({
        title: 'Error Details',
        content: 'Something went wrong! This modal appears after the error notification.',
        onClose: () => addEvent('Error modal closed'),
      });
    }, 1000);
  };

  const handleMultipleNotifications = () => {
    addEvent('Showing multiple notifications');
    notification.info('First (React 19)', 'This is the first notification');
    setTimeout(
      () => notification.success('Second (React 19)', 'This appears after 1 second'),
      1000
    );
    setTimeout(
      () => notification.warning('Third (React 19)', 'This appears after 2 seconds'),
      2000
    );
    setTimeout(() => notification.error('Fourth (React 19)', 'This appears after 3 seconds'), 3000);
  };

  const handleNestedModal = () => {
    addEvent('Opening nested modal demo');
    modal.open({
      title: 'Parent Modal (React 19)',
      content: (
        <div className="space-y-3">
          <p>This is the parent modal. Click the button below to open a nested modal.</p>
          <button
            onClick={() => {
              addEvent('Opening nested child modal');
              modal.open({
                title: 'Child Modal',
                content: 'This is a nested modal opened from within another modal!',
                size: 'sm',
                onClose: () => addEvent('Child modal closed'),
              });
            }}
            className="ds-button-primary"
          >
            Open Nested Modal
          </button>
        </div>
      ),
      onClose: () => addEvent('Parent modal closed'),
    });
  };

  const handleSizeVariations = () => {
    const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
    let index = 0;

    const showNextSize = () => {
      if (index < sizes.length) {
        const size = sizes[index];
        addEvent(`Opening ${size} modal`);
        modal.open({
          title: `Modal Size: ${size.toUpperCase()}`,
          content: `This is a ${size} sized modal from React 19. Click confirm to see the next size.`,
          size: size,
          onConfirm: () => {
            index++;
            if (index < sizes.length) {
              setTimeout(showNextSize, 300);
            } else {
              notification.success('Demo Complete', "You've seen all modal sizes!");
            }
          },
          onClose: () => {
            addEvent(`${size} modal closed`);
          },
        });
      }
    };

    showNextSize();
  };

  return (
    <div className="ds-card-padded">
      <div className="flex items-center justify-between ds-mb-md">
        <h3 className="ds-section-title">React 19 Modal Demo</h3>
        <span className="ds-badge ds-badge-info">React {React.version}</span>
      </div>

      {/* Action Buttons */}
      <div className="ds-mb-md">
        <div className="ds-text-small ds-text-muted ds-mb-sm">Test Modal Service:</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSimpleAlert}
            className="ds-button-primary"
          >
            Simple Alert
          </button>
          <button
            onClick={handleConfirmation}
            className="ds-button-primary"
          >
            Confirmation Dialog
          </button>
          <button
            onClick={handleFormModal}
            className="ds-button-primary"
          >
            Form Modal
          </button>
          <button
            onClick={handleCustomContent}
            className="ds-button-primary"
          >
            Custom Content
          </button>
          <button
            onClick={handleErrorDemo}
            className="ds-button-primary"
          >
            Error Example
          </button>
          <button
            onClick={handleMultipleNotifications}
            className="ds-button-primary"
          >
            Multiple Notifications
          </button>
          <button
            onClick={handleNestedModal}
            className="ds-button-primary"
          >
            Nested Modals
          </button>
          <button
            onClick={handleSizeVariations}
            className="ds-button-primary"
          >
            Size Variations
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div className="ds-card-compact ds-mb-md">
        <div className="ds-card-title ds-mb-sm">Event Log:</div>
        {events.length === 0 ? (
          <div className="ds-text-small ds-text-muted">
            No events yet. Click a button to start.
          </div>
        ) : (
          <div className="space-y-1">
            {events.map((event, index) => (
              <div key={index} className="ds-text-small font-mono ds-text-muted">
                → {event}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* React 19 Compatibility Info */}
      <div className="ds-card-compact ds-bg-accent-success-soft">
        <div className="ds-card-title ds-accent-success ds-mb-sm">
          React 19 Features & Capabilities
        </div>
        <div className="ds-text-small space-y-1">
          <p>• This MFE uses React {React.version} with createRoot()</p>
          <p>• Full support for React components in modal content</p>
          <p>• Interactive elements with event handlers work perfectly</p>
          <p>• Nested modals with buttons are fully supported</p>
          <p>• Rich HTML and JSX content rendering</p>
        </div>
      </div>
    </div>
  );
}

export default App;
