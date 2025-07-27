import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ModalManager } from './ModalManager';
import { NotificationManager } from './NotificationManager';
import { Toaster } from '@/components/ui/toaster';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <ModalManager />
      <NotificationManager />
      <Toaster />
    </div>
  );
};