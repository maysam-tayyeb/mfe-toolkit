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
      title: 'Simple Alert',
      content: 'This is a simple alert modal with just an OK button.',
      onClose: () => {
        addEvent('Simple alert closed');
        notification.info('Alert Closed', 'The simple alert was dismissed');
      }
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
      }
    });
  };

  const handleFormModal = () => {
    addEvent('Opening form modal');
    const formContent = (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input 
            type="text" 
            placeholder="Enter your name"
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            placeholder="Enter your email"
            className="w-full px-3 py-2 border rounded-md text-sm"
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
      }
    });
  };

  const handleCustomContent = () => {
    addEvent('Opening custom content modal');
    const customContent = (
      <div className="text-center space-y-4">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold">Welcome to Modal Service!</h3>
        <p className="text-sm text-muted-foreground">This modal demonstrates custom React content.</p>
        <ul className="text-left max-w-sm mx-auto space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Rich content support</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>React components</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
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
      }
    });
  };

  const handleErrorDemo = () => {
    addEvent('Triggering error notification');
    notification.error('Error Example', 'This is what an error notification looks like');
    
    setTimeout(() => {
      modal.open({
        title: 'Error Details',
        content: 'Something went wrong! This modal appears after the error notification.',
        onClose: () => addEvent('Error modal closed')
      });
    }, 1000);
  };

  const handleMultipleNotifications = () => {
    addEvent('Showing multiple notifications');
    notification.info('First (React 19)', 'This is the first notification');
    setTimeout(() => notification.success('Second (React 19)', 'This appears after 1 second'), 1000);
    setTimeout(() => notification.warning('Third (React 19)', 'This appears after 2 seconds'), 2000);
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
                onClose: () => addEvent('Child modal closed')
              });
            }}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Open Nested Modal
          </button>
        </div>
      ),
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
          content: `This is a ${size} sized modal from React 19. Click confirm to see the next size.`,
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
        <h3 className="text-lg font-semibold">React 19 Modal Demo</h3>
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
    </div>
  );
}

export default App;