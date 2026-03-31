import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getBackendBase, getToken, loginAdmin, setToken } from '../services/httpClient';

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
    const backendUrl = getBackendBase();
    if (backendUrl) {
      try {
        const data = await loginAdmin(e, password);
        setToken(data.token);
        const next = {
          email: data.admin.email,
          name: data.admin.name || data.admin.email.split('@')[0],
          role: data.admin.role,
          fromServer: true,
        };
        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(next));
        setSession(next);
        return true;
      } catch {
        return false;
      }
    }
    const next = { email: e, name: e.split('@')[0] || 'Admin', role: 'super_admin', fromServer: false };
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(next));
    setSession(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setToken(null);
    setSession(null);
  }, []);

  const isAuthenticated = useMemo(() => {
    if (!session) return false;
    if (getBackendBase() && !getToken()) return false;
    return true;
  }, [session]);

  const value = useMemo(
    () => ({ session, login, logout, isAuthenticated }),
    [session, login, logout, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
