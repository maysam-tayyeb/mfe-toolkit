import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export function ModalServiceDemoPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Modal Service Demo</h1>
        <p className="text-muted-foreground">
          Explore how the Modal Service works consistently across different frameworks
        </p>
      </div>

      {/* Service Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About Modal Service
          </CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            The Modal Service provides a centralized way to display modals from any MFE. 
            All modals are rendered by the container, ensuring consistent styling and behavior.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Simple alerts with customizable buttons</li>
                <li>Confirmation dialogs with callbacks</li>
                <li>Form modals with validation</li>
                <li>Multi-step wizards</li>
                <li>Custom content support</li>
                <li>Nested modal capability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">API Methods:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm font-mono">
                <li>modal.open(config)</li>
                <li>modal.close()</li>
                <li>modal.closeAll()</li>
                <li>modal.update(config)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Demos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Framework Implementations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* React 19 Demo */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>React 19</CardTitle>
                <Badge variant="default">Latest</Badge>
              </div>
              <CardDescription>
                Modern React implementation using hooks and functional components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-muted/10 min-h-[400px]">
                <RegistryMFELoader
                  id="mfe-react19-modal-demo"
                  fallback={
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      <p>Loading React 19 Modal Demo...</p>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* React 17 Demo */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>React 17</CardTitle>
                <Badge variant="outline">Legacy</Badge>
              </div>
              <CardDescription>
                Legacy React support demonstrating cross-version compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-muted/10 min-h-[400px]">
                <RegistryMFELoader
                  id="mfe-react17-modal-demo"
                  fallback={
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      <p>Loading React 17 Modal Demo...</p>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Vue 3 Demo */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vue 3</CardTitle>
                <Badge variant="outline">Cross-Framework</Badge>
              </div>
              <CardDescription>
                Vue.js implementation demonstrating cross-framework integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-muted/10 min-h-[400px]">
                <RegistryMFELoader
                  id="mfe-vue3-modal-demo"
                  fallback={
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      <p>Loading Vue 3 Modal Demo...</p>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Vanilla TypeScript Demo */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vanilla TypeScript</CardTitle>
                <Badge variant="outline">Lightweight</Badge>
              </div>
              <CardDescription>
                Pure TypeScript implementation without any framework
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-muted/10 min-h-[400px]">
                <RegistryMFELoader
                  id="mfe-vanilla-modal-demo"
                  fallback={
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      <p>Loading Vanilla TS Modal Demo...</p>
                    </div>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
          <CardDescription>
            How to use the Modal Service in your MFE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{`// In your MFE
export default {
  mount: (element, services) => {
    const { modal } = services;
    
    // Simple alert
    modal.open({
      title: 'Hello World',
      content: 'This is a simple modal',
      actions: [
        { label: 'OK', variant: 'primary' }
      ]
    });
    
    // Confirmation dialog
    modal.open({
      title: 'Confirm Action',
      content: 'Are you sure you want to proceed?',
      actions: [
        { 
          label: 'Cancel', 
          variant: 'secondary',
          onClick: () => console.log('Cancelled')
        },
        { 
          label: 'Confirm', 
          variant: 'primary',
          onClick: () => console.log('Confirmed')
        }
      ]
    });
  }
};`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}