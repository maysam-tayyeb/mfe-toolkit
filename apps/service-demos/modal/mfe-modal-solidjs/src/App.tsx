import { createSignal } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export default function App(props: AppProps) {
  const [count, setCount] = createSignal(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    props.services.logger?.info(`Button clicked! Count: ${count() + 1}`);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔷 Hello from mfe-modal-solidjs!
        </h1>
        <p class="ds-text-gray-600 ds-mb-6">
          Solid.js • Fine-Grained Reactivity
        </p>
        <div class="ds-card-compact ds-inline-block ds-p-4">
          <div class="ds-text-4xl ds-font-bold ds-text-accent-primary ds-mb-2">
            {count()}
          </div>
          <button class="ds-btn-primary" onClick={handleClick}>
            Click me!
          </button>
        </div>
      </div>
    </div>
  );
}