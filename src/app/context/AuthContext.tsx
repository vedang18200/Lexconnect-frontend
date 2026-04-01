import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { authAPI, setAuthToken, clearAuthToken } from '../services/api';
import type { UserResponse } from '../services/types';

type UserRole = 'citizen' | 'lawyer' | 'social-worker';

type RegisterPayload = {
  username: string;
  email: string;
  user_type: UserRole;
  phone?: string;
  location?: string;
  language?: string;
  password: string;
};

interface AuthContextType {
  user: (UserResponse & { user_id: number; user_type: 'citizen' | 'lawyer' | 'social-worker' }) | null;
  login: (username: string, password: string, userRole: 'citizen' | 'lawyer' | 'social-worker') => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string, userRole: 'citizen' | 'lawyer' | 'social-worker') => {
    setIsLoading(true);
    setError(null);
    try {
      let response;

      // Call role-specific login endpoint
      if (userRole === 'citizen') {
        response = await authAPI.loginAsCitizen(username, password) as any;
      } else if (userRole === 'lawyer') {
        response = await authAPI.loginAsLawyer(username, password) as any;
      } else if (userRole === 'social-worker') {
        response = await authAPI.loginAsSocialWorker(username, password) as any;
      } else {
        throw new Error('Invalid user role');
      }

      if (response.access_token && response.user_id && response.user_type) {
        setAuthToken(response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('userId', response.user_id.toString());
        localStorage.setItem('userType', response.user_type);

        // Set user object with response data
        setUser({
          id: response.user_id,
          username: username,
          email: username,
          user_type: response.user_type,
          user_id: response.user_id,
          is_active: true,
          created_at: new Date().toISOString(),
        } as any);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.register(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem('refreshToken');
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, isLoading, error }}>
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
