import { createContext, useContext, useEffect, useState } from "react";

import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "pulseops-auth-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEY)));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await apiRequest("/api/auth/me", { token });
        if (!mounted) return;
        setUser(response.user);
      } catch (error) {
        if (!mounted) return;
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [token]);

  const login = async (username, password) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { username, password },
    });

    setToken(response.token);
    setUser(response.user);
    localStorage.setItem(STORAGE_KEY, response.token);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

