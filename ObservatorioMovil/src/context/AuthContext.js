// AuthContext — Maneja el estado global de autenticación con Bearer token
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  getToken,
  saveToken,
  saveUser,
  getUser,
  clearSession,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar la app: verificar si hay token guardado y si sigue siendo válido
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
        // Verificar con el servidor que el token sigue siendo válido
        const userData = await getMe();
        setUser(userData);
        await saveUser(userData);
      }
    } catch (e) {
      // Token inválido o expirado — limpiar todo
      console.log('Sesión inválida:', e.message);
      await clearSession();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const data = await apiLogin(email, password);
    // El backend devuelve { token, user, message }
    setToken(data.token);
    setUser(data.user);
  };

  const signUp = async (userData) => {
    // 1. Crear cuenta
    await apiRegister(userData);
    // 2. Iniciar sesión automáticamente
    await signIn(userData.email, userData.password);
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loggedIn: !!token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
