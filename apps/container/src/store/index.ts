import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import modalReducer from './modalSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    modal: modalReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['modal/openModal'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.content', 'payload.onConfirm', 'payload.onClose'],
        // Ignore these paths in the state
        ignoredPaths: ['modal.config.content', 'modal.config.onConfirm', 'modal.config.onClose'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store on window for MFEs to access if needed
declare global {
  interface Window {
    __REDUX_STORE__: typeof store;
  }
}

window.__REDUX_STORE__ = store;
