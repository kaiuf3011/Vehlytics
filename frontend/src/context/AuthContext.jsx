import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("fm_token"));
  const [loading, setLoading] = useState(false);

  // Load user from stored token
  useEffect(() => {
    const stored = localStorage.getItem("fm_user");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const result = await api.login(email, password);
    setLoading(false);
    if (result.token) {
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem("fm_token", result.token);
      localStorage.setItem("fm_user", JSON.stringify(result.user));
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fm_token");
    localStorage.removeItem("fm_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
