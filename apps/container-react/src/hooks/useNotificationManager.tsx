import { useEffect, useRef } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useToast } from '@/hooks/useToast';

export const useNotificationManager = () => {
  const { notifications, removeNotification } = useUI();
  const { toast } = useToast();
  const activeToasts = useRef<Set<string>>(new Set());

  useEffect(() => {
    notifications.forEach((notification) => {
      // Skip if already shown or no ID
      if (!notification.id || activeToasts.current.has(notification.id)) {
        return;
      }

      activeToasts.current.add(notification.id);
      const variant = notification.type === 'error' ? 'destructive' : 'default';

      toast({
        title: notification.title,
        description: notification.message,
        variant,
        duration: notification.duration || 5000,
        onOpenChange: (open) => {
          if (!open && notification.id) {
            activeToasts.current.delete(notification.id);
            removeNotification(notification.id);
            if (notification.onClose) {
              notification.onClose();
            }
          }
        },
      });
    });
  }, [notifications, toast, removeNotification]);
};
