import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';
import { authAPI, setAuthToken, clearAuthToken, usersAPI } from '../services/api';
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

// Create context with a default value of undefined to detect if useAuth is used outside AuthProvider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(UserResponse & { user_id: number; user_type: 'citizen' | 'lawyer' | 'social-worker' }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restore authentication state from localStorage on mount
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType');
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');

    console.debug('[AuthContext] Restoring from localStorage:', {
      hasToken: !!authToken,
      hasUserId: !!userId,
      hasUserType: !!userType,
      hasUsername: !!username,
      hasUserEmail: !!userEmail,
      authToken: authToken ? `${authToken.substring(0, 20)}...` : 'none',
    });

    if (authToken && userId && userType && username) {
      // Restore both the token and user state
      setAuthToken(authToken);
      setUser({
        id: parseInt(userId),
        username: username,
        email: userEmail || username,
        user_type: userType as UserRole,
        user_id: parseInt(userId),
        is_active: true,
        created_at: localStorage.getItem('createdAt') || new Date().toISOString(),
      } as any);
      console.debug('[AuthContext] Session restored for user:', username);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string, userRole: 'citizen' | 'lawyer' | 'social-worker') => {
    setIsLoading(true);
    setError(null);
    try {
      // Trim whitespace from inputs
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      console.log('[AuthContext] Login attempt with:', {
        username: trimmedUsername,
        role: userRole,
      });

      let response;

      // Call role-specific login endpoint
      if (userRole === 'citizen') {
        response = await authAPI.loginAsCitizen(trimmedUsername, trimmedPassword) as any;
      } else if (userRole === 'lawyer') {
        response = await authAPI.loginAsLawyer(trimmedUsername, trimmedPassword) as any;
      } else if (userRole === 'social-worker') {
        response = await authAPI.loginAsSocialWorker(trimmedUsername, trimmedPassword) as any;
      } else {
        throw new Error('Invalid user role');
      }

      console.log('[AuthContext] FULL Login response:', response);
      console.log('[AuthContext] Response keys:', Object.keys(response));
      console.debug('[AuthContext] Login response received:', {
        hasAccessToken: !!response.access_token,
        hasUserId: !!response.user_id,
        hasUserType: !!response.user_type,
        accessToken: response.access_token ? `${response.access_token.substring(0, 20)}...` : 'none',
        userId: response.user_id,
        userType: response.user_type,
      });

      if (response.access_token && response.user_id && response.user_type) {
        console.log('[AuthContext] Saving token and user data...');
        setAuthToken(response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);

        let resolvedUsername =
          typeof response.username === 'string' && response.username.trim()
            ? response.username.trim()
            : '';
        let resolvedEmail =
          typeof response.email === 'string' && response.email.trim()
            ? response.email.trim()
            : '';

        // If login response does not include user profile fields, fetch current user.
        if (!resolvedUsername || !resolvedEmail || resolvedUsername === resolvedEmail) {
          try {
            const currentUser = await usersAPI.getCurrentUser() as UserResponse;
            if (currentUser?.username?.trim()) {
              resolvedUsername = currentUser.username.trim();
            }
            if (currentUser?.email?.trim()) {
              resolvedEmail = currentUser.email.trim();
            }
          } catch (profileError) {
            console.warn('[AuthContext] Unable to fetch current user after login:', profileError);
          }
        }

        if (!resolvedUsername) {
          resolvedUsername = trimmedUsername.includes('@')
            ? trimmedUsername.split('@')[0]
            : trimmedUsername;
        }

        if (!resolvedEmail) {
          resolvedEmail = trimmedUsername.includes('@') ? trimmedUsername : resolvedUsername;
        }

        localStorage.setItem('userId', response.user_id.toString());
        localStorage.setItem('userType', response.user_type);
        localStorage.setItem('username', resolvedUsername);
        localStorage.setItem('userEmail', resolvedEmail);
        localStorage.setItem('createdAt', new Date().toISOString());

        console.debug('[AuthContext] Token stored in authToken. Verifying...', {
          storedToken: localStorage.getItem('authToken') ? `${localStorage.getItem('authToken')!.substring(0, 20)}...` : 'none',
        });

        // Set user object with response data
        setUser({
          id: response.user_id,
          username: resolvedUsername,
          email: resolvedEmail,
          user_type: response.user_type,
          user_id: response.user_id,
          is_active: true,
          created_at: new Date().toISOString(),
        } as any);
      } else {
        console.error('[AuthContext] Response missing required fields:', {
          has_access_token: !!response.access_token,
          has_user_id: !!response.user_id,
          has_user_type: !!response.user_type,
        });
        throw new Error('Invalid login response: missing required fields');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      console.error('[AuthContext] Login error:', err);
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
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('createdAt');
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
