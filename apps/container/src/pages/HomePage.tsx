import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Package, Radio, Shield } from 'lucide-react';

export const HomePage: React.FC = () => {

  return (
    <div className="space-y-12 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">MFE Made Easy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern microfrontend platform with dynamic loading, shared services, and real-time communication
        </p>
      </div>

      {/* Key Features */}
      <div className="grid gap-4 md:grid-cols-4 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Dynamic Loading</h3>
          <p className="text-sm text-muted-foreground">ES modules loaded on-demand</p>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Shared Dependencies</h3>
          <p className="text-sm text-muted-foreground">React, Redux, TailwindCSS</p>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Event Bus</h3>
          <p className="text-sm text-muted-foreground">Real-time MFE communication</p>
        </div>
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Service Layer</h3>
          <p className="text-sm text-muted-foreground">Auth, Modal, Notifications</p>
        </div>
      </div>


      {/* Quick Actions */}
      <div className="w-full">
        <h2 className="text-3xl font-bold text-center mb-8">Explore the Platform</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
          <div className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">MFE Communication</h3>
            </div>
            <p className="text-muted-foreground">
              Monitor real-time events, track MFE status, and test inter-MFE messaging.
            </p>
            <Button asChild>
              <Link to="/mfe-communication">
                Open Communication Center
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Example MFE</h3>
            </div>
            <p className="text-muted-foreground">
              Experience a fully-featured React 19 microfrontend with all services integrated.
            </p>
            <Button asChild variant="outline">
              <Link to="/mfe/example">
                Load Example MFE
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">React 17 MFE</h3>
            </div>
            <p className="text-muted-foreground">
              See cross-version compatibility with a React 17 microfrontend in action.
            </p>
            <Button asChild variant="outline">
              <Link to="/mfe/react17">
                Load React 17 MFE
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-semibold">Platform Dashboard</h3>
            </div>
            <p className="text-muted-foreground">
              View system health, manage settings, and access platform configuration.
            </p>
            <Button asChild variant="secondary">
              <Link to="/dashboard">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>


      {/* Platform Stats */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8 max-w-7xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">Why Choose This Platform?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">96%</div>
            <p className="font-semibold">Smaller Bundles</p>
            <p className="text-sm text-muted-foreground">Shared dependencies via import maps</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">17+</div>
            <p className="font-semibold">React Versions</p>
            <p className="text-sm text-muted-foreground">Cross-version compatibility</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">ES</div>
            <p className="font-semibold">Modern Modules</p>
            <p className="text-sm text-muted-foreground">Native browser loading</p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">∞</div>
            <p className="font-semibold">Scalability</p>
            <p className="text-sm text-muted-foreground">Add unlimited MFEs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
