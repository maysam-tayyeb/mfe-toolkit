import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthSession } from '@mfe-toolkit/core';

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Default demo session
const defaultSession: AuthSession = {
  userId: '1',
  username: 'demo-user',
  email: 'demo@example.com',
  roles: ['user'],
  permissions: ['read', 'write'],
  isAuthenticated: true,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(defaultSession);
  const [loading, setLoading] = useState(false);

  const setSession = useCallback((newSession: AuthSession | null) => {
    setSessionState(newSession);
  }, []);

  const logout = useCallback(() => {
    setSessionState(null);
  }, []);

  const value: AuthContextType = {
    session,
    loading,
    setSession,
    setLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
