import { useState } from 'react';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/contexts/UIContext';
import { Hero, TabGroup, LoadingState } from '@mfe/design-system-react';
import { 
  MessageSquare, 
  CheckCircle, 
  FileText,
  Sparkles,
  Code,
  Zap,
  Box,
  Globe,
  ChevronRight
} from 'lucide-react';

export function ModalServiceDemoPage() {
  const { openModal, addNotification } = useUI();
  const [activeDemo, setActiveDemo] = useState('react19');

  const handleSimpleAlert = () => {
    openModal({
      title: 'Simple Alert',
      content: 'This is a basic modal alert with a single action button.',
      size: 'sm',
    });
  };

  const handleConfirmation = () => {
    openModal({
      title: 'Confirm Action',
      content: 'Are you sure you want to proceed with this action? This cannot be undone.',
      size: 'md',
      onConfirm: () => {
        addNotification({
          type: 'success',
          title: 'Action Confirmed',
          message: 'The action has been successfully completed.',
        });
      },
    });
  };

  const handleFormModal = () => {
    openModal({
      title: 'User Feedback Form',
      content: (
        <div className="space-y-4">
          <div>
            <label className="ds-label">Name</label>
            <input type="text" className="ds-input" placeholder="Enter your name" />
          </div>
          <div>
            <label className="ds-label">Email</label>
            <input type="email" className="ds-input" placeholder="your@email.com" />
          </div>
          <div>
            <label className="ds-label">Message</label>
            <textarea className="ds-textarea" placeholder="Your feedback..." />
          </div>
        </div>
      ),
      size: 'lg',
      onConfirm: () => {
        addNotification({
          type: 'info',
          title: 'Form Submitted',
          message: 'Thank you for your feedback!',
        });
      },
    });
  };

  const handleCustomContent = () => {
    openModal({
      title: 'Platform Statistics',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="ds-card-compact text-center">
              <p className="text-2xl font-bold ds-accent-primary">5</p>
              <p className="text-xs ds-text-muted">Active MFEs</p>
            </div>
            <div className="ds-card-compact text-center">
              <p className="text-2xl font-bold ds-accent-success">100%</p>
              <p className="text-xs ds-text-muted">Uptime</p>
            </div>
            <div className="ds-card-compact text-center">
              <p className="text-2xl font-bold ds-accent-warning">1.2s</p>
              <p className="text-xs ds-text-muted">Load Time</p>
            </div>
            <div className="ds-card-compact text-center">
              <p className="text-2xl font-bold ds-accent-info">45MB</p>
              <p className="text-xs ds-text-muted">Memory</p>
            </div>
          </div>
          <p className="text-sm ds-text-muted text-center">
            Real-time platform performance metrics
          </p>
        </div>
      ),
      size: 'md',
    });
  };

  const modalExamples = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Simple Alert',
      description: 'Basic modal with message',
      action: handleSimpleAlert,
      color: 'ds-icon-primary'
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: 'Confirmation',
      description: 'Yes/No dialog with callbacks',
      action: handleConfirmation,
      color: 'ds-icon-success'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Form Modal',
      description: 'Input fields and validation',
      action: handleFormModal,
      color: 'ds-icon-warning'
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Custom Content',
      description: 'Rich content and components',
      action: handleCustomContent,
      color: 'ds-icon-info'
    }
  ];

  const codeExamples = [
    {
      id: 'basic',
      label: 'Basic Alert',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`modal.open({
  title: 'Hello World',
  content: 'This is a simple modal',
  size: 'sm'
});`}</code>
        </pre>
      )
    },
    {
      id: 'confirm',
      label: 'Confirmation',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`modal.open({
  title: 'Confirm Action',
  content: 'Are you sure?',
  onConfirm: () => {
    console.log('Confirmed');
  },
  onCancel: () => {
    console.log('Cancelled');
  }
});`}</code>
        </pre>
      )
    },
    {
      id: 'custom',
      label: 'Custom Content',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`modal.open({
  title: 'Custom Modal',
  content: (
    <div>
      <input type="text" />
      <button>Submit</button>
    </div>
  ),
  size: 'lg'
});`}</code>
        </pre>
      )
    },
    {
      id: 'api',
      label: 'Full API',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`// Open modal
const modalId = modal.open(config);

// Update modal
modal.update(modalId, newConfig);

// Close specific modal
modal.close(modalId);

// Close all modals
modal.closeAll();`}</code>
        </pre>
      )
    }
  ];

  const frameworkDemos = [
    {
      id: 'react19',
      name: 'React 19',
      icon: <Zap className="h-4 w-4" />,
      badge: 'Latest',
      badgeVariant: 'default' as const,
      registryId: 'mfe-react19-modal-demo',
      description: 'Modern React with hooks'
    },
    {
      id: 'react17',
      name: 'React 17',
      icon: <Box className="h-4 w-4" />,
      badge: 'Legacy',
      badgeVariant: 'secondary' as const,
      registryId: 'mfe-react17-modal-demo',
      description: 'Cross-version compatibility'
    },
    {
      id: 'vue3',
      name: 'Vue 3',
      icon: <Globe className="h-4 w-4" />,
      badge: 'Cross-Framework',
      badgeVariant: 'outline' as const,
      registryId: 'mfe-vue3-modal-demo',
      description: 'Vue.js integration'
    },
    {
      id: 'vanilla',
      name: 'Vanilla TS',
      icon: <Code className="h-4 w-4" />,
      badge: 'Lightweight',
      badgeVariant: 'outline' as const,
      registryId: 'mfe-vanilla-modal-demo',
      description: 'No framework needed'
    }
  ];

  const activeFramework = frameworkDemos.find(f => f.id === activeDemo);

  return (
    <div className="ds-page">
      {/* Hero Section */}
      <Hero
        title="Modal Service"
        description="Centralized modal management across all MFEs with consistent styling and behavior"
        gradient
      >
        <div className="ds-mt-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="ds-bg-white/10 rounded-lg p-4">
            <div className="ds-icon-accent-white mb-2">
              <Zap className="h-6 w-6 mx-auto" />
            </div>
            <h4 className="text-sm font-semibold mb-1">Framework Agnostic</h4>
            <p className="text-xs opacity-90">Works with React, Vue, and Vanilla JS</p>
          </div>
          <div className="ds-bg-white/10 rounded-lg p-4">
            <div className="ds-icon-accent-white mb-2">
              <Code className="h-6 w-6 mx-auto" />
            </div>
            <h4 className="text-sm font-semibold mb-1">Consistent API</h4>
            <p className="text-xs opacity-90">Same interface across all MFEs</p>
          </div>
          <div className="ds-bg-white/10 rounded-lg p-4">
            <div className="ds-icon-accent-white mb-2">
              <Box className="h-6 w-6 mx-auto" />
            </div>
            <h4 className="text-sm font-semibold mb-1">Zero Pollution</h4>
            <p className="text-xs opacity-90">Service injection, no global variables</p>
          </div>
        </div>
      </Hero>

      {/* Live Examples */}
      <div className="ds-mb-lg">
        <h2 className="ds-section-title ds-mb-md">Try It Yourself</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modalExamples.map((example, index) => (
            <button
              key={index}
              onClick={example.action}
              className="ds-card-padded ds-hover-scale group text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${example.color}`}>
                  {example.icon}
                </div>
                <h3 className="ds-card-title group-hover:ds-accent-primary">
                  {example.title}
                </h3>
              </div>
              <p className="text-sm ds-text-muted mb-3">
                {example.description}
              </p>
              <div className="flex items-center gap-2 text-xs ds-accent-primary">
                <span>Open Modal</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Code Examples */}
      <div className="ds-card-padded ds-mb-lg">
        <h2 className="ds-section-title ds-mb-md">Implementation Examples</h2>
        <TabGroup tabs={codeExamples} defaultTab="basic" />
      </div>

      {/* Framework Demos */}
      <div className="ds-mb-lg">
        <h2 className="ds-section-title ds-mb-md">Framework Implementations</h2>
        
        {/* Framework Selector */}
        <div className="flex flex-wrap gap-2 ds-mb-md">
          {frameworkDemos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`ds-card-compact flex items-center gap-2 px-4 py-2 ${
                activeDemo === demo.id 
                  ? 'ds-bg-accent-primary-soft ds-border-accent-primary border-2' 
                  : 'hover:ds-bg-muted'
              }`}
            >
              <div className={activeDemo === demo.id ? 'ds-icon-primary' : 'ds-icon-muted'}>
                {demo.icon}
              </div>
              <span className="text-sm font-medium">{demo.name}</span>
              <Badge variant={demo.badgeVariant} className="text-xs">
                {demo.badge}
              </Badge>
            </button>
          ))}
        </div>

        {/* Active Demo */}
        {activeFramework && (
          <div className="ds-card p-0 overflow-hidden">
            <div className="ds-card-header flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="ds-icon-primary">
                  {activeFramework.icon}
                </div>
                <div>
                  <h3 className="ds-card-title">{activeFramework.name} Demo</h3>
                  <p className="text-xs ds-text-muted">{activeFramework.description}</p>
                </div>
              </div>
              <Badge variant={activeFramework.badgeVariant}>
                {activeFramework.badge}
              </Badge>
            </div>
            <div className="min-h-[400px] ds-bg-muted/30">
              <RegistryMFELoader
                id={activeFramework.registryId}
                fallback={
                  <LoadingState
                    size="md"
                    text={`Loading ${activeFramework.name} Demo...`}
                    subtext="Initializing modal service"
                    className="min-h-[400px]"
                  />
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ds-card-padded">
          <h3 className="ds-section-title ds-mb-sm">
            <span className="ds-icon-success">✓</span> Key Features
          </h3>
          <ul className="ds-list-check">
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Centralized modal management</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Consistent styling across MFEs</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Framework-agnostic API</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Custom content support</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Nested modal capability</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Keyboard navigation</span>
            </li>
          </ul>
        </div>

        <div className="ds-card-padded">
          <h3 className="ds-section-title ds-mb-sm">
            <span className="ds-icon-info">ℹ</span> API Methods
          </h3>
          <div className="space-y-3">
            <div>
              <code className="text-xs font-mono ds-accent-primary">modal.open(config)</code>
              <p className="text-xs ds-text-muted mt-1">Opens a new modal with configuration</p>
            </div>
            <div>
              <code className="text-xs font-mono ds-accent-primary">modal.close(id?)</code>
              <p className="text-xs ds-text-muted mt-1">Closes specific modal or topmost</p>
            </div>
            <div>
              <code className="text-xs font-mono ds-accent-primary">modal.closeAll()</code>
              <p className="text-xs ds-text-muted mt-1">Closes all open modals</p>
            </div>
            <div>
              <code className="text-xs font-mono ds-accent-primary">modal.update(id, config)</code>
              <p className="text-xs ds-text-muted mt-1">Updates an existing modal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}