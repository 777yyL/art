import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface UserConfig {
  apiConfig?: {
    baseURL?: string;
    apiKey?: string;
    model: string;
    temperature?: number;
  };
  userPrompt?: {
    content: string;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Get token from localStorage
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('art_token');
  }, []);

  // Set token to localStorage
  const setToken = useCallback((token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('art_token', token);
    } else {
      localStorage.removeItem('art_token');
    }
  }, []);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsInitialized(true);
      return;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setConfig({
          apiConfig: data.apiConfig,
          userPrompt: data.userPrompt,
        });
      } else {
        // Token invalid, clear it
        setToken(null);
        setUser(null);
        setConfig(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [getToken, setToken]);

  // Initialize on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      setToken(data.token);
      setUser(data.user);
      setConfig({
        apiConfig: data.apiConfig,
        userPrompt: data.userPrompt,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败',
      };
    } finally {
      setIsLoading(false);
    }
  }, [setToken]);

  // Register
  const register = useCallback(async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '注册失败',
      };
    } finally {
      setIsLoading(false);
    }
  }, [setToken]);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setConfig(null);
    router.push('/');
  }, [setToken, router]);

  // Save user config
  const saveConfig = useCallback(async (newConfig: UserConfig) => {
    const token = getToken();
    if (!token) {
      return { success: false, error: '未登录' };
    }

    try {
      const response = await fetch('/api/user/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apiConfig: newConfig.apiConfig,
          userPrompt: newConfig.userPrompt?.content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '保存失败');
      }

      setConfig((prev) => ({
        ...prev,
        ...newConfig,
      }));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存失败',
      };
    }
  }, [getToken]);

  return {
    user,
    config,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    saveConfig,
    fetchUser,
  };
}
