import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeNotification } from '@/store/notificationSlice';
import { useToast } from '@/components/ui/use-toast';

export const NotificationManager: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.notification.notifications);
  const { toast } = useToast();

  useEffect(() => {
    notifications.forEach((notification) => {
      const variant = notification.type === 'error' ? 'destructive' : 'default';
      
      toast({
        id: notification.id,
        title: notification.title,
        description: notification.message,
        variant,
        duration: notification.duration || 5000,
        onOpenChange: (open) => {
          if (!open && notification.id) {
            dispatch(removeNotification(notification.id));
            if (notification.onClose) {
              notification.onClose();
            }
          }
        },
      });
    });
  }, [notifications, toast, dispatch]);

  return null;
};