import React from 'react';
import { MFELoader } from './MFELoader';
import { MFEServices, MFEManifest } from '../types';

interface MFEPageProps {
  manifest: MFEManifest;
  services: MFEServices;
  fallback?: React.ReactNode;
  isolate?: boolean;
}

export const MFEPage: React.FC<MFEPageProps> = ({
  manifest,
  services,
  fallback,
  isolate = false,
}) => {
  return (
    <MFELoader
      name={manifest.name}
      url={manifest.url}
      services={services}
      fallback={fallback}
      isolate={isolate}
      onError={(error) => {
        services.logger.error(`Failed to load MFE ${manifest.name}:`, error);
        if (services.notification) {
          services.notification.error('MFE Load Error', error.message);
        }
      }}
    />
  );
};
