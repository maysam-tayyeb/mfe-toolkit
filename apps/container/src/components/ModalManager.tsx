import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { closeModal } from '@/store/modalSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const ModalManager: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, config } = useSelector((state: RootState) => state.modal);

  if (!config) {
    return null;
  }

  const handleClose = () => {
    if (config.onClose) {
      config.onClose();
    }
    dispatch(closeModal());
  };

  const handleConfirm = () => {
    if (config.onConfirm) {
      config.onConfirm();
    }
    dispatch(closeModal());
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={sizeClasses[config.size || 'md']}
        onInteractOutside={(e) => {
          if (!config.closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {typeof config.content === 'string' ? (
            <DialogDescription>{config.content}</DialogDescription>
          ) : (
            config.content
          )}
        </div>
        {config.onConfirm && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};