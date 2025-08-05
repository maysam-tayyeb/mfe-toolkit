import React from 'react';
import { useParams } from 'react-router-dom';
import { MFELoader } from './MFELoader';
import { MFEServices } from '../types';
import { MFERegistryService } from '../services/mfe-registry';

interface MFEPageProps {
  services: MFEServices;
  registry: MFERegistryService;
  fallback?: React.ReactNode;
}

export const MFEPage: React.FC<MFEPageProps> = ({ services, registry, fallback }) => {
  const { mfeName } = useParams<{ mfeName: string }>();

  if (!mfeName) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold text-red-600">MFE name not provided</h2>
      </div>
    );
  }

  const manifest = registry.get(mfeName);

  if (!manifest) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold text-red-600">MFE not found: {mfeName}</h2>
        <p className="text-gray-600 mt-2">The requested microfrontend is not registered.</p>
      </div>
    );
  }

  return (
    <MFELoader
      name={manifest.name}
      url={manifest.url}
      services={services}
      fallback={fallback}
      onError={(error) => {
        services.logger.error(`Failed to load MFE ${manifest.name}:`, error);
        services.notification.error('MFE Load Error', error.message);
      }}
    />
  );
};
