import { createSignal } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export default function App(props: AppProps) {
  const [count, setCount] = createSignal(0);
  const [message, setMessage] = createSignal('Welcome to Solid.js MFE!');

  const handleLog = () => {
    props.services.logger?.info(`[mfe-modal-solidjs] Count is ${count()}`);
    setMessage(`Logged count: ${count()}`);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-mb-6 ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔷 mfe-modal-solidjs
        </h1>
        <p class="ds-text-gray-600">Solid.js with Fine-Grained Reactivity</p>
      </div>

      <div class="ds-text-center ds-mb-6">
        <div class="ds-text-3xl ds-font-bold">{count()}</div>
        <div class="ds-text-sm ds-text-gray-600">Counter Value</div>
      </div>

      <div class="ds-bg-accent-primary-soft ds-p-3 ds-rounded ds-mb-4">
        <p class="ds-text-sm">{message()}</p>
      </div>

      <div class="ds-flex ds-gap-2 ds-justify-center">
        <button onClick={() => setCount(c => c + 1)} class="ds-btn-primary">
          Increment
        </button>
        <button onClick={() => setCount(0)} class="ds-btn-outline">
          Reset
        </button>
        <button onClick={handleLog} class="ds-btn-secondary">
          Log Count
        </button>
      </div>
    </div>
  );
}