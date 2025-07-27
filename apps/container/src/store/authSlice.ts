import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthSession } from '@mfe/dev-kit';

interface AuthState {
  session: AuthSession | null;
  loading: boolean;
}

const initialState: AuthState = {
  session: {
    userId: '1',
    username: 'demo-user',
    email: 'demo@example.com',
    roles: ['user'],
    permissions: ['read', 'write'],
    isAuthenticated: true,
  },
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthSession | null>) => {
      state.session = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.session = null;
    },
  },
});

export const { setSession, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;