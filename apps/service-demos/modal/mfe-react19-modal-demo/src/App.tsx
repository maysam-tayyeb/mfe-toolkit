import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

function App({ services }: AppProps) {
  const [lastAction, setLastAction] = useState<string>('');
  const { modal } = services;

  const handleSimpleAlert = () => {
    modal.open({
      title: 'Simple Alert',
      content: 'This is a simple alert modal with just an OK button.',
      actions: [
        { 
          label: 'OK', 
          variant: 'primary',
          onClick: () => setLastAction('Simple alert closed')
        }
      ]
    });
  };

  const handleConfirmation = () => {
    modal.open({
      title: 'Confirm Action',
      content: 'Are you sure you want to proceed with this action?',
      actions: [
        { 
          label: 'Cancel', 
          variant: 'secondary',
          onClick: () => setLastAction('Action cancelled')
        },
        { 
          label: 'Confirm', 
          variant: 'primary',
          onClick: () => setLastAction('Action confirmed')
        }
      ]
    });
  };

  const handleFormModal = () => {
    // Create a form component
    const FormContent = () => {
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');

      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Please fill out the form below:</p>
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>
      );
    };

    modal.open({
      title: 'User Information Form',
      content: <FormContent />,
      actions: [
        { 
          label: 'Cancel', 
          variant: 'secondary',
          onClick: () => setLastAction('Form cancelled')
        },
        { 
          label: 'Submit', 
          variant: 'primary',
          onClick: () => setLastAction('Form submitted')
        }
      ]
    });
  };

  const handleCustomContent = () => {
    const CustomContent = () => (
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
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Custom styling</span>
          </li>
        </ul>
      </div>
    );

    modal.open({
      title: 'Custom Content Modal',
      content: <CustomContent />,
      actions: [
        { 
          label: 'Amazing!', 
          variant: 'primary',
          onClick: () => setLastAction('Custom content viewed')
        }
      ]
    });
  };

  const handleNestedModal = () => {
    modal.open({
      title: 'Parent Modal',
      content: 'This is the parent modal. Click the button below to open a nested modal.',
      actions: [
        {
          label: 'Open Nested',
          variant: 'secondary',
          onClick: () => {
            modal.open({
              title: 'Nested Modal',
              content: 'This modal was opened from another modal!',
              actions: [
                { 
                  label: 'Close Nested', 
                  variant: 'primary',
                  onClick: () => setLastAction('Nested modal closed')
                }
              ]
            });
          }
        },
        { 
          label: 'Close', 
          variant: 'primary',
          onClick: () => setLastAction('Parent modal closed')
        }
      ]
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h3 className="text-2xl font-semibold mb-2">React 19 Modal Demo</h3>
      <p className="text-muted-foreground mb-6">Click the buttons below to test different modal types:</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={handleSimpleAlert} 
          className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
        >
          Simple Alert
        </button>
        
        <button 
          onClick={handleConfirmation} 
          className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
        >
          Confirmation Dialog
        </button>
        
        <button 
          onClick={handleFormModal} 
          className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
        >
          Form Modal
        </button>
        
        <button 
          onClick={handleCustomContent} 
          className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
        >
          Custom Content
        </button>
        
        <button 
          onClick={handleNestedModal} 
          className="px-4 py-3 bg-card hover:bg-muted border border-border rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-sm"
        >
          Nested Modals
        </button>
      </div>

      {lastAction && (
        <div className="p-4 bg-accent border border-border rounded-lg">
          <p className="text-sm">
            Last action: <strong className="font-semibold">{lastAction}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;