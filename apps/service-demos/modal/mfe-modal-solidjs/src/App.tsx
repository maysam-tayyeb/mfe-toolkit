import { createSignal } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export const App = (props: AppProps) => {
  const [count, setCount] = createSignal(0);

  const handleClick = () => {
    setCount(count() + 1);
    props.services.logger?.info(`Button clicked! Count: ${count() + 1}`);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔷 Hello from mfe-modal-solidjs!
        </h1>
        <p class="ds-text-gray-600 ds-mb-6">
          Solid.js MFE • Fine-Grained Reactivity
        </p>
        
        <div class="ds-card-compact ds-inline-block ds-p-4">
          <div class="ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2">
            {count()}
          </div>
          <button 
            onClick={handleClick}
            class="ds-btn-primary"
          >
            Click me!
          </button>
        </div>
        
        <p class="ds-text-sm ds-text-gray-500 ds-mt-6">
          Built with ❤️ using MFE Toolkit
        </p>
      </div>
    </div>
  );
};