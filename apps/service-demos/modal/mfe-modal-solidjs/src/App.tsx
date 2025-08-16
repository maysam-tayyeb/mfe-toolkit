import { createSignal, createMemo, For } from 'solid-js';
import type { MFEServices } from '@mfe-toolkit/core';

interface AppProps {
  services: MFEServices;
}

export function App(props: AppProps) {
  const [modalCount, setModalCount] = createSignal(0);
  const [customTitle, setCustomTitle] = createSignal('Custom Modal');
  const [customContent, setCustomContent] = createSignal('This is custom modal content from Solid.js.');
  const [selectedSize, setSelectedSize] = createSignal<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isPending, setIsPending] = createSignal(false);
  
  const sizes = ['sm', 'md', 'lg', 'xl'] as const;

  const showModal = (config: any) => {
    if (!props.services.modal) {
      console.error('Modal service not available');
      return;
    }
    
    props.services.modal.show(config);
    setModalCount(c => c + 1);
  };

  const showSimpleModal = () => {
    showModal({
      title: 'Solid.js Modal',
      content: 'This modal is powered by Solid.js - fine-grained reactivity at its best!',
      showCloseButton: true
    });
  };

  const showConfirmModal = () => {
    showModal({
      title: 'Confirm Action',
      content: (
        <div>
          <p>Are you sure you want to proceed?</p>
          <p class="ds-text-sm ds-text-muted ds-mt-2">
            Triggered from Solid.js MFE with fine-grained reactivity
          </p>
        </div>
      ),
      onConfirm: () => {
        console.log('Confirmed from Solid.js!');
        props.services.modal?.close();
        props.services.notification?.show({
          title: 'Success',
          message: 'Action confirmed with Solid.js reactivity!',
          type: 'success'
        });
      },
      showCloseButton: true
    });
  };

  const showSizeModal = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    showModal({
      title: `${size.toUpperCase()} Modal`,
      content: (
        <div>
          <p>This is a <strong>{size}</strong> modal.</p>
          <p class="ds-text-sm ds-text-muted ds-mt-2">
            Solid.js with compiled reactive primitives
          </p>
        </div>
      ),
      size,
      showCloseButton: true
    });
  };

  const showCustomModal = () => {
    showModal({
      title: customTitle(),
      content: <p>{customContent()}</p>,
      size: selectedSize(),
      showCloseButton: true
    });
  };

  const showFeatureModal = () => {
    showModal({
      title: 'Solid.js Features',
      content: (
        <div class="ds-space-y-4">
          <div class="ds-bg-accent-primary-soft ds-p-3 ds-rounded">
            <h3 class="ds-font-semibold ds-mb-2">Fine-Grained Reactivity</h3>
            <ul class="ds-list-disc ds-list-inside ds-text-sm">
              <li>No Virtual DOM - direct updates</li>
              <li>Compiled reactive primitives</li>
              <li>createSignal, createMemo, createEffect</li>
              <li>Exceptional performance</li>
              <li>Small bundle size (~7kb)</li>
              <li>JSX without React</li>
            </ul>
          </div>
          <div class="ds-grid ds-grid-cols-3 ds-gap-2">
            <div class="ds-card-compact ds-text-center">
              <div class="ds-text-2xl">🔷</div>
              <div class="ds-text-xs">Solid.js</div>
            </div>
            <div class="ds-card-compact ds-text-center">
              <div class="ds-text-2xl">⚡</div>
              <div class="ds-text-xs">Fast</div>
            </div>
            <div class="ds-card-compact ds-text-center">
              <div class="ds-text-2xl">🎯</div>
              <div class="ds-text-xs">Precise</div>
            </div>
          </div>
        </div>
      ),
      size: 'lg',
      showCloseButton: true
    });
  };

  const showReactiveModal = () => {
    setIsPending(true);
    setTimeout(() => {
      showModal({
        title: 'Reactive Signals',
        content: (
          <div>
            <p>Solid.js uses signals for reactivity!</p>
            <div class="ds-mt-3 ds-p-2 ds-bg-accent-success-soft ds-rounded">
              <p class="ds-text-sm">Modal count (signal): {modalCount()}</p>
              <p class="ds-text-sm">Custom title: {customTitle()}</p>
              <p class="ds-text-sm">Selected size: {selectedSize()}</p>
            </div>
            <p class="ds-text-sm ds-text-muted ds-mt-2">
              Updates are fine-grained and efficient
            </p>
          </div>
        ),
        showCloseButton: true
      });
      setIsPending(false);
    }, 300);
  };

  return (
    <div class="ds-card ds-p-6 ds-m-4">
      <div class="ds-mb-6 ds-text-center">
        <h1 class="ds-text-3xl ds-font-bold ds-mb-2 ds-text-accent-primary">
          🔷 Solid.js Modal Demo
        </h1>
        <p class="ds-text-gray-600">
          Fine-Grained Reactive Modal Service
        </p>
        {isPending() && (
          <p class="ds-text-sm ds-text-warning ds-mt-2">
            Processing...
          </p>
        )}
      </div>

      <div class="ds-grid ds-grid-cols-3 ds-gap-4 ds-mb-6">
        <div class="ds-card-compact ds-text-center">
          <div class="ds-text-2xl ds-font-bold ds-text-accent-primary">{modalCount()}</div>
          <div class="ds-text-sm ds-text-gray-600">Modals Opened</div>
        </div>
        <div class="ds-card-compact ds-text-center">
          <div class="ds-text-2xl">🔷</div>
          <div class="ds-text-sm ds-text-gray-600">Solid.js</div>
        </div>
        <div class="ds-card-compact ds-text-center">
          <div class="ds-text-2xl">⚡</div>
          <div class="ds-text-sm ds-text-gray-600">Reactive</div>
        </div>
      </div>

      <div class="ds-space-y-4">
        <div>
          <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Modal Types</h3>
          <div class="ds-flex ds-flex-wrap ds-gap-2">
            <button onClick={showSimpleModal} class="ds-btn-primary">
              Simple Modal
            </button>
            <button onClick={showConfirmModal} class="ds-btn-success">
              Confirm Dialog
            </button>
            <button onClick={showFeatureModal} class="ds-btn-secondary">
              Features
            </button>
            <button onClick={showReactiveModal} class="ds-btn-warning">
              Reactive Signals
            </button>
          </div>
        </div>

        <div>
          <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Modal Sizes</h3>
          <div class="ds-flex ds-gap-2">
            <For each={sizes}>
              {(size) => (
                <button 
                  onClick={() => showSizeModal(size)} 
                  class="ds-btn-outline ds-btn-sm"
                >
                  {size.toUpperCase()}
                </button>
              )}
            </For>
          </div>
        </div>

        <div>
          <h3 class="ds-text-lg ds-font-semibold ds-mb-3">Custom Modal</h3>
          <div class="ds-space-y-3">
            <input
              type="text"
              value={customTitle()}
              onInput={(e) => setCustomTitle(e.currentTarget.value)}
              class="ds-input"
              placeholder="Modal title"
            />
            <textarea
              value={customContent()}
              onInput={(e) => setCustomContent(e.currentTarget.value)}
              class="ds-textarea"
              rows={2}
              placeholder="Modal content"
            />
            <select 
              value={selectedSize()}
              onChange={(e) => setSelectedSize(e.currentTarget.value as any)}
              class="ds-select"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
            <button onClick={showCustomModal} class="ds-btn-primary">
              Show Custom Modal
            </button>
          </div>
        </div>
      </div>

      <div class="ds-mt-6 ds-pt-4 ds-border-t ds-text-center ds-text-sm ds-text-gray-500">
        Solid.js Modal Service Demo • Fine-Grained Reactivity
      </div>
    </div>
  );
}