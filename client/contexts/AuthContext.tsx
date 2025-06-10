'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth, User, AuthState } from '@/lib/auth';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  useEffect(() => {
    const stored = getStoredAuth();
    setAuthState(stored);
  }, []);

  const login = (token: string, user: User) => {
    setStoredAuth(token, user);
    setAuthState({ user, token, isAuthenticated: true });
  };

  const logout = () => {
    clearStoredAuth();
    setAuthState({ user: null, token: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}