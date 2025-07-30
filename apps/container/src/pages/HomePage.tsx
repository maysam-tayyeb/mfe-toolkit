import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Zap,
  Package,
  Radio,
  Database,
  AlertCircle,
  Activity,
  Blocks,
  GitBranch,
} from 'lucide-react';
import { MFE_CONFIG } from '@mfe/shared';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MFE Made Easy</h1>
          <p className="text-muted-foreground mt-2">
            A modern microfrontend platform with dynamic loading, universal state management, and
            seamless cross-framework integration
          </p>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Dynamic Loading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ES Modules</div>
            <p className="text-xs text-muted-foreground">On-demand loading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Universal State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Real-time</div>
            <p className="text-xs text-muted-foreground">Cross-MFE & cross-tab sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Event System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Type-safe</div>
            <p className="text-xs text-muted-foreground">Typed event bus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Blocks className="h-4 w-4" />
              Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">React, Vue, Vanilla JS</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Explore Demos */}
        <Card>
          <CardHeader>
            <CardTitle>Explore Demos</CardTitle>
            <CardDescription>Interactive demonstrations of platform capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Link
                to="/universal-state-demo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Universal State Demo</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/mfe-communication"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Event Communication</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/error-boundary-demo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Error Boundaries</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
            <div className="pt-2">
              <Button asChild size="sm" className="w-full">
                <Link to="/dashboard">
                  View All Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available MFEs */}
        <Card>
          <CardHeader>
            <CardTitle>Available MFEs</CardTitle>
            <CardDescription>Microfrontend applications ready to explore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Link
                to={`/mfe/${MFE_CONFIG.serviceExplorer.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Service Explorer</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  React 19
                </Badge>
              </Link>

              <Link
                to={`/mfe/${MFE_CONFIG.legacyServiceExplorer.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Legacy Explorer</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  React 17
                </Badge>
              </Link>

              <Link
                to="/mfe/eventDemo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Event Demo</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Events
                </Badge>
              </Link>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                All MFEs support hot reloading and service injection
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Install dependencies</p>
                  <code className="text-xs text-muted-foreground">pnpm install</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Build packages</p>
                  <code className="text-xs text-muted-foreground">pnpm build</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">Start development</p>
                  <code className="text-xs text-muted-foreground">pnpm dev</code>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <GitBranch className="h-4 w-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Why Choose This Platform?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold">97%</div>
              <p className="text-sm font-medium">Bundle Reduction</p>
              <p className="text-xs text-muted-foreground">Import maps</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">3</div>
              <p className="text-sm font-medium">Frameworks</p>
              <p className="text-xs text-muted-foreground">Cross-framework</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">0ms</div>
              <p className="text-sm font-medium">State Sync</p>
              <p className="text-xs text-muted-foreground">Real-time updates</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">100%</div>
              <p className="text-sm font-medium">Type Safety</p>
              <p className="text-xs text-muted-foreground">End-to-end TS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
