import React, { useState, useTransition } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to React 18 MFE!');
  const [isPending, startTransition] = useTransition();

  const handleLog = () => {
    startTransition(() => {
      services.logger?.info(`[mfe-modal-react18] Count is ${count}`);
      setMessage(`Logged count: ${count}`);
    });
  };

  return (
    <div className="ds-card ds-p-6 ds-m-4">
      <div className="ds-mb-6 ds-text-center">
        <h1 className="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          ⚛️ mfe-modal-react18
        </h1>
        <p className="ds-text-gray-600">React 18 with Concurrent Features</p>
        {isPending && <p className="ds-text-sm ds-text-warning">Updating...</p>}
      </div>

      <div className="ds-text-center ds-mb-6">
        <div className="ds-text-3xl ds-font-bold">{count}</div>
        <div className="ds-text-sm ds-text-gray-600">Counter Value</div>
      </div>

      <div className="ds-bg-accent-primary-soft ds-p-3 ds-rounded ds-mb-4">
        <p className="ds-text-sm">{message}</p>
      </div>

      <div className="ds-flex ds-gap-2 ds-justify-center">
        <button onClick={() => setCount(c => c + 1)} className="ds-btn-primary">
          Increment
        </button>
        <button onClick={() => setCount(0)} className="ds-btn-outline">
          Reset
        </button>
        <button onClick={handleLog} className="ds-btn-secondary">
          Log Count
        </button>
      </div>
    </div>
  );
};