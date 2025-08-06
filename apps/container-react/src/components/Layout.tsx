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
      <div className="pt-14"> {/* Add padding-top to account for fixed navbar */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>
      </div>
      <ModalManager />
      <NotificationManager />
      <Toaster />
    </div>
  );
};