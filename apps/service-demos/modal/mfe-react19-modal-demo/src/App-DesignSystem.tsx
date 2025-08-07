import React, { useState } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices & {
    designSystem?: {
      getReactComponents(): Promise<any>;
    };
  };
}

function App({ services }: AppProps) {
  const [events, setEvents] = useState<string[]>([]);
  const [Card, setCard] = useState<any>(null);
  const [Button, setButton] = useState<any>(null);
  const [designSystemLoaded, setDesignSystemLoaded] = useState(false);
  
  const { modal, notification } = services;

  // Load design system components if available
  React.useEffect(() => {
    const loadDesignSystem = async () => {
      if (services.designSystem) {
        try {
          const components = await services.designSystem.getReactComponents();
          if (components) {
            setCard(components.Card);
            setButton(components.Button);
            setDesignSystemLoaded(true);
          }
        } catch (error) {
          console.warn('Design system not available, using fallback styles');
        }
      }
    };
    loadDesignSystem();
  }, [services.designSystem]);

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
      },
    });
  };

  const handleCustomContent = () => {
    addEvent('Opening custom content modal');
    const customContent = (
      <div className="text-center space-y-4">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold">Welcome to Modal Service!</h3>
        <p className="text-sm text-muted-foreground">
          This modal demonstrates custom React content.
        </p>
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
      title: 'Custom Content',
      content: customContent,
      size: 'lg',
      onClose: () => {
        addEvent('Custom modal closed');
      },
    });
  };

  const handleErrorExample = () => {
    addEvent('Showing error modal');
    modal.open({
      title: 'Error Occurred',
      content: 'Something went wrong. Please try again later.',
      variant: 'destructive',
      onClose: () => {
        addEvent('Error modal closed');
        notification.error('Error', 'The error modal was closed');
      },
    });
  };

  const handleMultipleNotifications = () => {
    addEvent('Showing multiple notifications');
    notification.success('Success', 'Operation completed successfully');
    setTimeout(() => notification.info('Info', 'Here is some information'), 100);
    setTimeout(() => notification.warning('Warning', 'Please be careful'), 200);
    setTimeout(() => notification.error('Error', 'Something went wrong'), 300);
  };

  // Use design system components if loaded, otherwise fallback
  const CardComponent = Card || FallbackCard;
  const ButtonComponent = Button || FallbackButton;

  return (
    <div className="space-y-6 p-6">
      <CardComponent variant="elevated">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">React 19 Modal Demo</h3>
          <p className="text-sm text-muted-foreground mb-4">React 19.1.0</p>
          
          {designSystemLoaded && (
            <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
              ✅ Design System Loaded
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-sm font-medium">Test Modal Service:</p>
            <div className="grid grid-cols-2 gap-2">
              <ButtonComponent onClick={handleSimpleAlert} variant="outline" size="sm">
                Simple Alert
              </ButtonComponent>
              <ButtonComponent onClick={handleConfirmation} variant="outline" size="sm">
                Confirmation Dialog
              </ButtonComponent>
              <ButtonComponent onClick={handleFormModal} variant="outline" size="sm">
                Form Modal
              </ButtonComponent>
              <ButtonComponent onClick={handleCustomContent} variant="outline" size="sm">
                Custom Content
              </ButtonComponent>
              <ButtonComponent onClick={handleErrorExample} variant="outline" size="sm">
                Error Example
              </ButtonComponent>
              <ButtonComponent onClick={handleMultipleNotifications} variant="outline" size="sm">
                Multiple Notifications
              </ButtonComponent>
            </div>
          </div>
        </div>
      </CardComponent>

      <CardComponent variant="default">
        <div className="p-6">
          <p className="text-sm font-medium mb-2">Event Log:</p>
          <div className="space-y-1 text-xs font-mono">
            {events.length === 0 ? (
              <p className="text-muted-foreground">No events yet. Click a button to start.</p>
            ) : (
              events.map((event, index) => (
                <div key={index} className="text-muted-foreground">
                  {event}
                </div>
              ))
            )}
          </div>
        </div>
      </CardComponent>

      <CardComponent variant="bordered" padding="compact">
        <div className="p-4">
          <p className="text-sm font-medium mb-2">React 19 Features & Capabilities</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• This MFE uses React 19.1.0 with createRoot()</li>
            <li>• Full support for React components in modal content</li>
            <li>• Interactive elements with event handlers work perfectly</li>
            <li>• Design system components injected via services (no global pollution)</li>
            <li>• Graceful fallback when design system unavailable</li>
          </ul>
        </div>
      </CardComponent>
    </div>
  );
}

// Fallback components when design system is not available
const FallbackCard: React.FC<any> = ({ children, variant = 'default', padding = 'normal' }) => {
  const baseClasses = 'rounded-lg border bg-card text-card-foreground';
  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-md',
    bordered: 'border-2',
  };
  const paddingClasses = {
    compact: 'p-4',
    normal: 'p-6',
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]}`}>
      {children}
    </div>
  );
};

const FallbackButton: React.FC<any> = ({ children, onClick, variant = 'default', size = 'md' }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors';
  const variantClasses = {
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  };
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </button>
  );
};

export default App;