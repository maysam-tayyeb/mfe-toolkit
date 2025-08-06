import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

function App({ services }: AppProps) {
  const [events, setEvents] = useState<string[]>([]);
  const { modal, notification } = services;
  
  const addEvent = (event: string) => {
    setEvents(prev => [...prev.slice(-4), event]);
  };

  const handleSimpleAlert = () => {
    addEvent('Opening simple alert');
    modal.open({
      title: 'Simple Alert (React 17)',
      content: 'This is a simple alert modal from a React 17 MFE with just an OK button.',
      onClose: () => {
        addEvent('Simple alert closed');
        notification.info('Alert Closed', 'The simple alert was dismissed');
      }
    });
  };

  const handleConfirmation = () => {
    addEvent('Opening confirmation dialog');
    modal.open({
      title: 'Confirm Action (React 17)',
      content: 'Are you sure you want to proceed with this action? This modal is rendered from a React 17 MFE.',
      onConfirm: () => {
        addEvent('Action confirmed');
        notification.success('Confirmed', 'Action was confirmed successfully from React 17');
      },
      onClose: () => {
        addEvent('Action cancelled');
        notification.warning('Cancelled', 'Action was cancelled');
      }
    });
  };

  const handleFormModal = () => {
    addEvent('Opening form modal');
    // React 17 MFEs must pass plain text strings to the modal service
    const formContent = `This is a form modal from React ${React.version} MFE.

Due to cross-version limitations, React 17 MFEs can only display plain text content in modals.

For interactive forms and rich content, React 17 MFEs should:
• Use their own internal modals
• Communicate results via the event bus
• Use the notification service for feedback`;

    modal.open({
      title: 'User Form Demo (React 17)',
      content: formContent,
      size: 'md',
      onConfirm: () => {
        addEvent('Form submitted');
        notification.success('Form Submitted', 'Your information was saved from React 17 MFE');
      },
      onClose: () => {
        addEvent('Form cancelled');
      }
    });
  };

  const handleCustomContent = () => {
    addEvent('Opening custom content modal');
    // React 17 MFEs must pass plain text strings to the modal service
    const customContent = `🎉 React 17 Modal Service!

This modal demonstrates React 17 compatibility with the modal service.

React Version: ${React.version}
Rendering: ReactDOM.render()

Key Features:
✓ Legacy React support
✓ Plain text content only  
✓ Cross-version compatibility
✓ Full modal API access

Limitations:
• No rich HTML content
• No interactive elements
• No nested React components`;

    modal.open({
      title: 'Custom Content Modal',
      content: customContent,
      size: 'lg',
      onClose: () => {
        addEvent('Custom modal closed');
        notification.success('Nice!', 'You explored the React 17 custom content modal');
      }
    });
  };

  const handleErrorDemo = () => {
    addEvent('Triggering error notification');
    notification.error('Error Example', 'This is an error notification from React 17 MFE');
    
    setTimeout(() => {
      modal.open({
        title: 'Error Details (React 17)',
        content: `Something went wrong! This modal appears after the error notification.

Error: Example error from React 17 MFE

This error was triggered from a React ${React.version} MFE.
The modal service works across React versions, but only supports plain text content for React 17 MFEs.`,
        onClose: () => addEvent('Error modal closed')
      });
    }, 1000);
  };

  const handleMultipleNotifications = () => {
    addEvent('Showing multiple notifications');
    notification.info('First (React 17)', 'This is the first notification');
    setTimeout(() => notification.success('Second (React 17)', 'This appears after 1 second'), 1000);
    setTimeout(() => notification.warning('Third (React 17)', 'This appears after 2 seconds'), 2000);
    setTimeout(() => notification.error('Fourth (React 17)', 'This appears after 3 seconds'), 3000);
  };

  const handleNestedModal = () => {
    addEvent('Opening nested modal demo');
    modal.open({
      title: 'Parent Modal (React 17)',
      content: `This is the parent modal from React ${React.version}.

⚠️ Limitation: React 17 MFEs cannot create nested modals with interactive triggers.

Why? Nested modals require React elements with event handlers, which aren't compatible across React versions.

React 17 MFEs must use plain text content only when passing content to the React 19 container's modal service.

For complex interactions, consider:
• Using the event bus for communication
• Building modals within the MFE itself
• Using the notification service for feedback`,
      onClose: () => addEvent('Parent modal closed')
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
          content: `This is a ${size} sized modal from React 17. Click confirm to see the next size.`,
          size: size,
          onConfirm: () => {
            index++;
            if (index < sizes.length) {
              setTimeout(showNextSize, 300);
            } else {
              notification.success('Demo Complete', 'You\'ve seen all modal sizes!');
            }
          },
          onClose: () => {
            addEvent(`${size} modal closed`);
          }
        });
      }
    };
    
    showNextSize();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">React 17 Modal Demo</h3>
        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
          React {React.version}
        </span>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground mb-2">Test Modal Service:</div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleSimpleAlert}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Simple Alert
          </button>
          <button 
            onClick={handleConfirmation}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Confirmation Dialog
          </button>
          <button 
            onClick={handleFormModal}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Form Modal
          </button>
          <button 
            onClick={handleCustomContent}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Custom Content
          </button>
          <button 
            onClick={handleErrorDemo}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Error Example
          </button>
          <button 
            onClick={handleMultipleNotifications}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Multiple Notifications
          </button>
          <button 
            onClick={handleNestedModal}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Nested Modals
          </button>
          <button 
            onClick={handleSizeVariations}
            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-md hover:bg-zinc-700 hover:text-zinc-100 dark:hover:bg-zinc-300 dark:hover:text-zinc-900 transition-colors"
          >
            Size Variations
          </button>
        </div>
      </div>

      {/* Event Log */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="text-sm font-medium mb-3">Event Log:</div>
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">No events yet. Click a button to start.</div>
        ) : (
          <div className="space-y-1">
            {events.map((event, index) => (
              <div key={index} className="text-sm font-mono text-muted-foreground">
                → {event}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* React 17 Info */}
      <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
        <div className="text-sm font-medium mb-2 text-amber-900 dark:text-amber-100">
          React 17 Compatibility Demo
        </div>
        <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <p>• This MFE uses React {React.version} with ReactDOM.render()</p>
          <p>• Running inside a React 19 container application</p>
          <p>• Full access to all modal service features</p>
          <p>• Demonstrates cross-version React compatibility</p>
        </div>
      </div>
    </div>
  );
}

export default App;