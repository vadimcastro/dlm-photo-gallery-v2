// src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
  role?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!accessToken && !!user;

  const fetchUser = async (token: string) => {
    try {
      console.log('Fetching user with token:', token.substring(0, 10) + '...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        if (response.status === 401) {
          Cookies.remove('accessToken');
          setAccessToken(null);
        }
        throw new Error(`Failed to fetch user: ${errorText}`);
      }

      const userData = await response.json();
      console.log('User data received:', userData);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error in fetchUser:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login to:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }).toString(),
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Login failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData || 'Login failed');
      }

      const data = await response.json();
      const newAccessToken = data.access_token;
      
      // Set cookie and state
      Cookies.set('accessToken', newAccessToken, { 
        expires: 7,
        path: '/',
        secure: false, // Set to false for HTTP, will be true when we have HTTPS
        sameSite: 'lax'
      });
      setAccessToken(newAccessToken);

      // Fetch user data
      const userFetched = await fetchUser(newAccessToken);
      if (!userFetched) {
        throw new Error('Failed to fetch user data after login');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during login');
      }
    }
  };

  const logout = () => {
    Cookies.remove('accessToken');
    setUser(null);
    setAccessToken(null);
    router.push('/');
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = Cookies.get('accessToken');
        console.log('Auth init - stored token:', !!storedToken);
        console.log('Current pathname:', pathname);
        
        if (storedToken) {
          setAccessToken(storedToken);
          const userFetched = await fetchUser(storedToken);
          
          if (!userFetched && pathname.startsWith('/dashboard')) {
            console.log('User fetch failed for dashboard route');
            // Let dashboard page handle authentication UI
          }
        } else if (pathname.startsWith('/dashboard')) {
          console.log('No token found for dashboard route');
          // Let dashboard page handle authentication UI
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Let dashboard page handle authentication UI
        // No automatic redirects
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken: null,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshAccessToken: async () => null,
      }}
    >
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