import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ModalManager } from './ModalManager';
import { NotificationManager } from './NotificationManager';
import { Toaster } from '@/components/ui/toaster';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      <div className="flex-1 lg:ml-64"> {/* ml-64 matches the w-64 width of sidebar */}
        <main className="px-4 py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
      <ModalManager />
      <NotificationManager />
      <Toaster />
    </div>
  );
};