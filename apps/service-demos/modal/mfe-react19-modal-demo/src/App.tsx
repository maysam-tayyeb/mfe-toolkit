import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';
import './App.css';

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
        <div className="form-content">
          <p>Please fill out the form below:</p>
          <div className="form-group">
            <label>
              Name:
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </label>
          </div>
          <div className="form-group">
            <label>
              Email:
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </label>
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
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h3>Welcome to Modal Service!</h3>
        <p>This modal demonstrates custom React content.</p>
        <ul style={{ textAlign: 'left', maxWidth: '300px', margin: '16px auto' }}>
          <li>✓ Rich content support</li>
          <li>✓ React components</li>
          <li>✓ Interactive elements</li>
          <li>✓ Custom styling</li>
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
    <div className="modal-demo">
      <h3>React 19 Modal Demo</h3>
      <p>Click the buttons below to test different modal types:</p>
      
      <div className="demo-grid">
        <button onClick={handleSimpleAlert} className="demo-button">
          Simple Alert
        </button>
        
        <button onClick={handleConfirmation} className="demo-button">
          Confirmation Dialog
        </button>
        
        <button onClick={handleFormModal} className="demo-button">
          Form Modal
        </button>
        
        <button onClick={handleCustomContent} className="demo-button">
          Custom Content
        </button>
        
        <button onClick={handleNestedModal} className="demo-button">
          Nested Modals
        </button>
      </div>

      {lastAction && (
        <div className="last-action">
          Last action: <strong>{lastAction}</strong>
        </div>
      )}
    </div>
  );
}

export default App;