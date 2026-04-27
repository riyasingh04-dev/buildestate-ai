'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'builder' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  getSessionId: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Session ID Utility ────────────────────────────────────────────────────────
// Generates and persists a UUID-based anonymous session ID in localStorage.
function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = generateSessionId();
    localStorage.setItem('session_id', sid);
  }
  return sid;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ensure a session_id always exists, even before login
    getOrCreateSessionId();

    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);

    const response = await api.get('/auth/me');
    setUser(response.data);

    // ── Merge anonymous session into user account ────────────────────────────
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      try {
        await api.post('/ml/merge-session', { session_id: sessionId });
        // Clear session_id so a fresh one is generated for the next anonymous visit
        localStorage.removeItem('session_id');
      } catch (err) {
        // Non-critical — log but don't block login
        console.warn('Session merge failed (non-critical):', err);
      }
    }

    // Role-based redirection
    const userRole = response.data.role;
    if (userRole === 'admin') {
      router.push('/admin');
    } else if (userRole === 'builder') {
      router.push('/dashboard');
    } else {
      router.push('/user-dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // Generate a fresh session_id for the next anonymous browsing session
    localStorage.removeItem('session_id');
    getOrCreateSessionId();
    router.push('/login');
  };

  const getSessionId = () => getOrCreateSessionId();

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getSessionId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
