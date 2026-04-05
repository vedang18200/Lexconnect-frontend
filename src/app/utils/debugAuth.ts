/**
 * Debug Authentication State
 *
 * Expose auth debugging utilities to window object for console use
 * Usage in browser console: window.debugAuth.getAuthStatus()
 */

import { getAuthToken, hasAuthToken } from '../services/api';

export interface AuthDebugStatus {
  hasToken: boolean;
  tokenExists: boolean;
  tokenPreview: string;
  userId: string | null;
  username: string | null;
  userType: string | null;
  createdAt: string | null;
  allStorageKeys: string[];
  tokenHeaderValue: string;
}

export const debugAuth = {
  /**
   * Get current authentication status
   */
  getAuthStatus(): AuthDebugStatus {
    const token = getAuthToken();
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const userType = localStorage.getItem('userType');
    const createdAt = localStorage.getItem('createdAt');

    // Get all localStorage keys
    const allStorageKeys = Object.keys(localStorage);
    const authRelatedKeys = allStorageKeys.filter(key =>
      ['auth', 'token', 'user'].some(term => key.toLowerCase().includes(term))
    );

    return {
      hasToken: hasAuthToken(),
      tokenExists: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...${token.substring(token.length - 10)}` : 'NO TOKEN',
      userId,
      username,
      userType,
      createdAt,
      allStorageKeys: authRelatedKeys,
      tokenHeaderValue: token ? `Bearer ${token}` : 'NO HEADER',
    };
  },

  /**
   * Print formatted auth status to console
   */
  printStatus(): void {
    const status = this.getAuthStatus();
    console.table(status);
    console.log('Full Authorization header that would be sent:', status.tokenHeaderValue);
  },

  /**
   * Test if token is being sent in API calls
   */
  async testTokenInRequest(): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No token found in localStorage!');
      return;
    }

    console.log('📤 Testing token in real API request to /cases/my-cases/statistics...');
    try {
      const response = await fetch('http://localhost:8000/api/v1/cases/my-cases/statistics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });
      } else {
        const data = await response.json();
        console.log('✅ Success! Response:', data);
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
    }
  },

  /**
   * Test another authenticated endpoint for comparison
   */
  async testOtherAuthEndpoint(endpoint: string = '/citizens/profile'): Promise<void> {
    const token = getAuthToken();
    if (!token) {
      console.error('❌ No token found in localStorage!');
      return;
    }

    const fullUrl = `http://localhost:8000/api/v1${endpoint}`;
    console.log(`📤 Testing token on ${endpoint}...`);
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`❌ Endpoint ${endpoint} returned:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });
      } else {
        const data = await response.json();
        console.log(`✅ Endpoint ${endpoint} works! Response:`, data);
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
    }
  },

  /**
   * Clear all auth tokens (useful for testing)
   */
  clearAllAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('createdAt');
    console.log('🗑️ All auth data cleared from localStorage');
    window.location.href = '/login';
  },
};

// Expose to window object for console access in development
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  console.log('🔧 Debug Auth Available - Use window.debugAuth.getAuthStatus() or window.debugAuth.printStatus()');
}
