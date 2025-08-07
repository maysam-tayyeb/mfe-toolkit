/**
 * Development Modal Service
 * Provides modal functionality for MFE development
 */

import type { ModalService, ModalOptions } from '@mfe-toolkit/core';

export class DevModalService implements ModalService {
  private activeModals: Map<string, ModalOptions> = new Map();
  private modalContainer: HTMLElement | null = null;
  private modalStack: string[] = [];

  constructor() {
    this.ensureModalContainer();
  }

  private ensureModalContainer(): void {
    if (typeof document === 'undefined') return;
    
    if (!this.modalContainer) {
      this.modalContainer = document.getElementById('dev-modal-container');
      if (!this.modalContainer) {
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'dev-modal-container';
        this.modalContainer.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          pointer-events: none;
        `;
        document.body.appendChild(this.modalContainer);
      }
    }
  }

  open(options: ModalOptions): string {
    const modalId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.activeModals.set(modalId, options);
    this.modalStack.push(modalId);
    
    this.renderModal(modalId, options);
    console.log('[DevModalService] Modal opened:', modalId, options);
    
    return modalId;
  }

  close(modalId?: string): void {
    const idToClose = modalId || this.modalStack[this.modalStack.length - 1];
    
    if (!idToClose) return;
    
    const modal = this.activeModals.get(idToClose);
    if (modal) {
      if (modal.onClose) {
        modal.onClose();
      }
      
      this.activeModals.delete(idToClose);
      this.modalStack = this.modalStack.filter(id => id !== idToClose);
      this.removeModalFromDOM(idToClose);
      
      console.log('[DevModalService] Modal closed:', idToClose);
    }
  }

  closeAll(): void {
    const modalIds = [...this.modalStack];
    modalIds.forEach(id => this.close(id));
  }

  private renderModal(modalId: string, options: ModalOptions): void {
    if (!this.modalContainer) return;
    
    const modalWrapper = document.createElement('div');
    modalWrapper.id = modalId;
    modalWrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      z-index: ${9999 + this.modalStack.length};
    `;
    
    const modalContent = document.createElement('div');
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };
    const sizeClass = sizeClasses[options.size || 'md'];
    
    modalContent.className = `bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClass} w-full mx-4 max-h-[90vh] overflow-y-auto`;
    modalContent.innerHTML = `
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-4">${options.title}</h2>
        <div class="modal-body mb-4">
          ${typeof options.content === 'string' ? options.content : '<div id="modal-react-content"></div>'}
        </div>
        <div class="flex justify-end gap-2">
          ${options.onConfirm ? `
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600" id="${modalId}-cancel">
              Cancel
            </button>
            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" id="${modalId}-confirm">
              Confirm
            </button>
          ` : `
            <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" id="${modalId}-close">
              OK
            </button>
          `}
        </div>
      </div>
    `;
    
    modalWrapper.appendChild(modalContent);
    this.modalContainer.appendChild(modalWrapper);
    
    // Handle React content
    if (typeof options.content !== 'string') {
      const reactContainer = modalWrapper.querySelector('#modal-react-content');
      if (reactContainer && (window as any).React && (window as any).ReactDOM) {
        const React = (window as any).React;
        const ReactDOM = (window as any).ReactDOM;
        const root = ReactDOM.createRoot ? 
          ReactDOM.createRoot(reactContainer) : 
          { render: (element: any) => ReactDOM.render(element, reactContainer) };
        root.render(options.content);
      }
    }
    
    // Add event listeners
    modalWrapper.addEventListener('click', (e) => {
      if (e.target === modalWrapper) {
        this.close(modalId);
      }
    });
    
    const closeBtn = modalWrapper.querySelector(`#${modalId}-close`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close(modalId));
    }
    
    const cancelBtn = modalWrapper.querySelector(`#${modalId}-cancel`);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.close(modalId));
    }
    
    const confirmBtn = modalWrapper.querySelector(`#${modalId}-confirm`);
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (options.onConfirm) {
          options.onConfirm();
        }
        this.close(modalId);
      });
    }
  }

  private removeModalFromDOM(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      modalElement.remove();
    }
  }
}