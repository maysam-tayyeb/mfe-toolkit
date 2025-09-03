/**
 * Modal Service Implementation
 */

import type { 
  ModalService, 
  BaseModalConfig, 
  ModalStackEntry, 
  ModalServiceConfig 
} from './types';
import type { Logger } from '@mfe-toolkit/core';

export class ModalServiceImpl<TModalConfig extends BaseModalConfig = BaseModalConfig> 
  implements ModalService<TModalConfig> {
  
  private modals: Map<string, ModalStackEntry<TModalConfig>> = new Map();
  private logger?: Logger;
  private config: ModalServiceConfig;
  private idCounter = 0;

  constructor(config: ModalServiceConfig = {}, logger?: Logger) {
    this.config = {
      maxModals: config.maxModals || 5,
      defaultZIndex: config.defaultZIndex || 1000,
      debug: config.debug || false
    };
    this.logger = logger;
  }

  /**
   * Open a modal
   */
  open(config: TModalConfig): string {
    // Check max modals limit
    if (this.modals.size >= (this.config.maxModals || 5)) {
      if (this.logger && this.config.debug) {
        this.logger.warn('Modal limit reached, closing oldest modal');
      }
      // Close the oldest modal
      const firstKey = this.modals.keys().next().value;
      if (firstKey) {
        this.close(firstKey);
      }
    }

    const id = `modal-${Date.now()}-${++this.idCounter}`;
    
    const entry: ModalStackEntry<TModalConfig> = {
      id,
      config: {
        ...config,
        zIndex: config.zIndex || this.config.defaultZIndex + this.modals.size
      },
      onClose: config.onClose
    };

    this.modals.set(id, entry);

    if (this.logger && this.config.debug) {
      this.logger.debug(`Modal opened: ${id}`, { title: config.title });
    }

    // Set up escape key handler if needed
    if (config.closeOnEscape !== false) {
      this.setupEscapeHandler(id);
    }

    return id;
  }

  /**
   * Close a specific modal or the topmost modal
   */
  close(id?: string): void {
    if (!id) {
      // Close the topmost modal
      const entries = Array.from(this.modals.entries());
      if (entries.length > 0) {
        id = entries[entries.length - 1][0];
      } else {
        return;
      }
    }

    const modal = this.modals.get(id);
    if (modal) {
      // Call onClose callback if provided
      if (modal.onClose) {
        try {
          modal.onClose();
        } catch (error) {
          if (this.logger) {
            this.logger.error('Error in modal onClose callback', error);
          }
        }
      }

      this.modals.delete(id);
      
      if (this.logger && this.config.debug) {
        this.logger.debug(`Modal closed: ${id}`);
      }
    }
  }

  /**
   * Close all modals
   */
  closeAll(): void {
    const modalIds = Array.from(this.modals.keys());
    modalIds.forEach(id => this.close(id));
    
    if (this.logger && this.config.debug) {
      this.logger.debug('All modals closed');
    }
  }

  /**
   * Update modal configuration
   */
  update(id: string, config: Partial<TModalConfig>): void {
    const modal = this.modals.get(id);
    if (modal) {
      modal.config = { ...modal.config, ...config };
      
      if (this.logger && this.config.debug) {
        this.logger.debug(`Modal updated: ${id}`, config);
      }
    }
  }

  /**
   * Check if a modal is open
   */
  isOpen(id?: string): boolean {
    if (id) {
      return this.modals.has(id);
    }
    return this.modals.size > 0;
  }

  /**
   * Get all open modals
   */
  getOpenModals(): Array<{ id: string; config: TModalConfig }> {
    return Array.from(this.modals.entries()).map(([id, entry]) => ({
      id,
      config: entry.config
    }));
  }

  /**
   * Set up escape key handler for a modal
   */
  private setupEscapeHandler(id: string): void {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const modal = this.modals.get(id);
        if (modal && modal.config.closeOnEscape !== false) {
          this.close(id);
          document.removeEventListener('keydown', handler);
        }
      }
    };

    // Store handler reference for cleanup
    const modal = this.modals.get(id);
    if (modal) {
      (modal as any).__escapeHandler = handler;
      document.addEventListener('keydown', handler);
    }
  }
}

/**
 * Factory function to create a Modal Service
 */
export function createModalService<TModalConfig extends BaseModalConfig = BaseModalConfig>(
  config?: ModalServiceConfig,
  logger?: Logger
): ModalService<TModalConfig> {
  return new ModalServiceImpl<TModalConfig>(config, logger);
}