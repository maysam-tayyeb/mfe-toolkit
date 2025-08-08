import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ModalManager } from './ModalManager';
import { NotificationManager } from './NotificationManager';
import { Toaster } from '@/components/ui/toaster';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen ds-bg-base">
      <Navigation />
      <div className="pt-14"> {/* Add padding-top to account for fixed navbar */}
        <main className="ds-page-container"> {/* Using design system page container */}
          <Outlet />
        </main>
      </div>
      <ModalManager />
      <NotificationManager />
      <Toaster />
    </div>
  );
};