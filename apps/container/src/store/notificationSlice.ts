import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationConfig } from '@mfe/dev-kit';
import { generateId } from '@mfe/shared';

interface NotificationState {
  notifications: NotificationConfig[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationConfig>) => {
      const notification = {
        ...action.payload,
        id: action.payload.id || generateId(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
