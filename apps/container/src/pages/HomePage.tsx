import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to MFE Platform</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern microfrontend architecture with shared dependencies
        </p>
      </div>

      {auth.session && (
        <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-3">Current User</h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Username:</span> {auth.session.username}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {auth.session.email}
            </p>
            <p>
              <span className="text-muted-foreground">Roles:</span> {auth.session.roles.join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-muted-foreground">
            View your application dashboard with analytics and insights.
          </p>
          <Button asChild>
            <Link to="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold">Example MFE</h2>
          <p className="text-muted-foreground">
            Explore a demonstration microfrontend with service integration.
          </p>
          <Button asChild variant="outline">
            <Link to="/mfe/example">
              Load Example MFE
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold">Documentation</h2>
          <p className="text-muted-foreground">
            Learn how to build and integrate your own microfrontends.
          </p>
          <Button variant="secondary">View Docs</Button>
        </div>
      </div>
    </div>
  );
};
