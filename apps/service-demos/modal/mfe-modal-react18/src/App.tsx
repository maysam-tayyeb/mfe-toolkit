import React from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const handleNotification = () => {
    services.notification?.show({
      title: 'Hello from mfe-modal-react18',
      message: 'This is a notification from the MFE',
      type: 'success'
    });
  };

  return (
    <div className="ds-p-4">
      <h2 className="ds-text-2xl ds-font-bold ds-mb-4">
        mfe-modal-react18 MFE
      </h2>
      <p className="ds-text-gray-600 ds-mb-4">
        This MFE was created with mfe-toolkit-cli
      </p>
      <button 
        onClick={handleNotification}
        className="ds-btn-primary"
      >
        Show Notification
      </button>
    </div>
  );
};