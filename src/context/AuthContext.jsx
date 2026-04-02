import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AuthService from '../api/services/AuthService';

export const AUTH_SESSION_KEY = 'gtbs_flicksy_admin_session';

const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p && typeof p.email === 'string' ? p : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = useCallback(async (email, password) => {
    const e = email?.trim();
    if (!e || !password) return false;

    try {
      const res = await AuthService.adminLogin(e, password);
      if (!res?.success) return false;

      const token = res?.data?.accessToken || res?.data?.token || res?.accessToken || res?.token;
      if (!token) return false;

      const refreshToken = res?.data?.refreshToken || res?.refreshToken;

      sessionStorage.setItem('token', token);
      if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);

      const next = {
        email: res?.data?.admin?.email || e,
        name: res?.data?.admin?.fullName || res?.data?.admin?.name || e.split('@')[0],
        role: res?.data?.admin?.role || 'admin',
      };
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(next));
      setSession(next);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    setSession(null);
  }, []);

  const isAuthenticated = !!sessionStorage.getItem('token');

  const value = useMemo(() => ({ session, login, logout, isAuthenticated }), [session, login, logout, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
