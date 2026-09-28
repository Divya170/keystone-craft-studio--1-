'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from './api';

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AdminAuthState {
  token: string | null;
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);
const STORAGE_KEY = 'keystone_admin_token';

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    api
      .get<AdminUser>('/admin/auth/me', stored)
      .then((me) => setAdmin(me))
      .catch((err) => {
        // Only an expired/invalid token signs the admin out — a network
        // blip keeps the session.
        if (err instanceof ApiError && err.status === 401) {
          window.localStorage.removeItem(STORAGE_KEY);
          setToken(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ accessToken: string; admin: AdminUser }>('/admin/auth/login', { email, password });
    window.localStorage.setItem(STORAGE_KEY, res.accessToken);
    setToken(res.accessToken);
    setAdmin(res.admin);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ token, admin, loading, login, logout }), [token, admin, loading, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export function isAuthError(err: unknown) {
  return err instanceof ApiError && err.status === 401;
}
