import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ModalManager } from './ModalManager';
import { NotificationManager } from './NotificationManager';
import { Toaster } from '@/components/ui/toaster';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex relative">
      <Navigation />
      <div className="flex-1 lg:ml-72 transition-all duration-500"> {/* ml-72 matches the w-72 width of expanded sidebar */}
        <main className="px-4 py-8 max-w-7xl mx-auto">
          {/* Add padding-top on mobile to account for mobile menu button */}
          <div className="lg:hidden h-16" />
          <Outlet />
        </main>
      </div>
      <ModalManager />
      <NotificationManager />
      <Toaster />
    </div>
  );
};