import React from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { openModal } from '@/store/modalSlice';
import { addNotification } from '@/store/notificationSlice';

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();

  const handleTestModal = () => {
    dispatch(
      openModal({
        title: 'Test Modal',
        content: 'This is a test modal from the Dashboard page.',
        size: 'md',
        onConfirm: () => {
          dispatch(
            addNotification({
              type: 'success',
              title: 'Action Confirmed',
              message: 'You clicked confirm on the modal.',
            })
          );
        },
      })
    );
  };

  const handleTestNotifications = () => {
    dispatch(
      addNotification({
        type: 'info',
        title: 'Info Notification',
        message: 'This is an informational message.',
      })
    );

    setTimeout(() => {
      dispatch(
        addNotification({
          type: 'success',
          title: 'Success!',
          message: 'Operation completed successfully.',
        })
      );
    }, 1000);

    setTimeout(() => {
      dispatch(
        addNotification({
          type: 'warning',
          title: 'Warning',
          message: 'Please review your settings.',
        })
      );
    }, 2000);

    setTimeout(() => {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'An error occurred during processing.',
        })
      );
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Test container services and explore platform features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Modal Service</h2>
          <p className="text-sm text-muted-foreground">
            Test the modal service that MFEs can use to display dialogs.
          </p>
          <Button onClick={handleTestModal}>Open Test Modal</Button>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Notification Service</h2>
          <p className="text-sm text-muted-foreground">
            Test different types of notifications that MFEs can trigger.
          </p>
          <Button onClick={handleTestNotifications} variant="outline">
            Show Notifications
          </Button>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">MFE Statistics</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Registered MFEs:</span>{' '}
              <span className="text-muted-foreground">1</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Active Sessions:</span>{' '}
              <span className="text-muted-foreground">1</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Platform Version:</span>{' '}
              <span className="text-muted-foreground">1.0.0</span>
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full justify-start">
              Reload MFE Registry
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Clear Cache
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              View Event Log
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
