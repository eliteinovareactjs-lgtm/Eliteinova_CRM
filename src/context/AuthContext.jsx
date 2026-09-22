import { createContext, useContext, useMemo, useState } from 'react';
import { USERS, WEBSITES } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeWebsiteId, setActiveWebsiteId] = useState(null);

  const login = (username, password, role) => {
    const match = USERS.find(
      (u) => u.username === username && u.password === password && u.role === role
    );
    if (!match) {
      return { ok: false, message: 'Invalid credentials. Check your ID and password.' };
    }
    setUser(match);
    setActiveWebsiteId(match.websiteId ?? WEBSITES[0].id);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    setActiveWebsiteId(null);
  };

  const activeWebsite = useMemo(
    () => WEBSITES.find((w) => w.id === activeWebsiteId) || null,
    [activeWebsiteId]
  );

  const value = {
    user,
    isAuthenticated: !!user,
    role: user?.role,
    login,
    logout,
    activeWebsiteId,
    setActiveWebsiteId,
    activeWebsite,
    canSwitchWebsites: user?.role === 'superadmin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}