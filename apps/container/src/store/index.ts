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