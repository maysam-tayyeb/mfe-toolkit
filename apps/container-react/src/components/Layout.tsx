import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ModalManager } from './ModalManager';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { Toaster } from '@/components/ui/toaster';

export const Layout: React.FC = () => {
  useNotificationManager();

  return (
    <div className="min-h-screen ds-bg-base">
      <Navigation />
      <div className="pt-14">
        {' '}
        {/* Add padding-top to account for fixed navbar */}
        <main className="ds-page-container">
          {' '}
          {/* Centered layout from design system */}
          <Outlet />
        </main>
      </div>
      <ModalManager />
      <Toaster />
    </div>
  );
};
