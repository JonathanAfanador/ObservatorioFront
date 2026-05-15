// AuthContext — Maneja el estado global de autenticación con Bearer token
// Incluye: persistencia de sesión, verificación al inicio y cierre por inactividad
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  getToken,
  saveToken,
  saveUser,
  clearSession,
} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Límite de inactividad ─────────────────────────────────────────────────────
// Si la app estuvo en segundo plano más de este tiempo, se cierra la sesión.
const INACTIVITY_LIMIT_MS = 20 * 60 * 1000; // 20 minutos (limite definitivo)
const BACKGROUND_TIME_KEY = '@observatorio_bg_time';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Usamos ref para el appState para no perder el valor entre renders
  const appStateRef = useRef(AppState.currentState);

  // ── Logout completo: notifica al backend (auditoría) + limpia local ───────
  const performFullLogout = useCallback(async () => {
    try {
      await apiLogout(); // → Laravel registra 'CierreSesion' en la auditoría
    } catch (e) {
      console.warn('[Auth] Error al notificar logout al servidor:', e.message);
      await clearSession(); // Si falla el servidor, igual limpiamos local
    } finally {
      await AsyncStorage.removeItem(BACKGROUND_TIME_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  // ── Verificar sesión guardada al inicio de la app ─────────────────────────
  const checkSession = useCallback(async () => {
    const startTime = Date.now(); // Para forzar tiempo mínimo de Splash Screen
    try {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
        const userData = await getMe(); // Valida con el servidor
        setUser(userData);
        await saveUser(userData);
      }
    } catch (e) {
      console.log('[Auth] Sesión inválida al iniciar:', e.message);
      await performFullLogout();
    } finally {
      // Forzar que la Splash Screen dure al menos 2.8 segundos para ver la animación fluida
      const elapsed = Date.now() - startTime;
      const minSplashDuration = 2800; 
      const remaining = minSplashDuration - elapsed;
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }
      setLoading(false);
    }
  }, [performFullLogout]);

  // ── Al iniciar la app: cargar sesión ─────────────────────────────────────
  useEffect(() => {
    checkSession();
  }, []);

  // ── Detector de inactividad via AppState ──────────────────────────────────
  useEffect(() => {
    const handleAppStateChange = async (nextState) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      if (nextState === 'background' || nextState === 'inactive') {
        // App va al fondo → guardar timestamp exacto
        await AsyncStorage.setItem(BACKGROUND_TIME_KEY, Date.now().toString());
        console.log('[Auth] App en fondo, guardando timestamp...');

      } else if (nextState === 'active' && (prevState === 'background' || prevState === 'inactive')) {
        // App vuelve al frente → calcular tiempo en segundo plano
        const savedToken = await getToken();
        if (!savedToken) return; // Ya no hay sesión activa

        const bgTimeStr = await AsyncStorage.getItem(BACKGROUND_TIME_KEY); // ← lectura correcta
        if (bgTimeStr) {
          const elapsed = Date.now() - parseInt(bgTimeStr, 10);
          console.log(`[Auth] Tiempo en fondo: ${elapsed}ms (límite: ${INACTIVITY_LIMIT_MS}ms)`);

          if (elapsed > INACTIVITY_LIMIT_MS) {
            // Superó el límite → cerrar sesión con registro en auditoría
            console.log('[Auth] Inactividad superada → cerrando sesión...');
            await performFullLogout();
            return;
          }
        }

        // Dentro del límite → re-validar token con el servidor
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (e) {
          console.log('[Auth] Token expirado al volver del fondo:', e.message);
          await performFullLogout();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [performFullLogout]); // dependencia estable via useCallback

  // ── Login ─────────────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.removeItem(BACKGROUND_TIME_KEY); // reset inactividad
  };

  // ── Registro + login automático ───────────────────────────────────────────
  const signUp = async (userData) => {
    await apiRegister(userData);
    await signIn(userData.email, userData.password);
  };

  // ── Logout manual ─────────────────────────────────────────────────────────
  const signOut = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } finally {
      await AsyncStorage.removeItem(BACKGROUND_TIME_KEY);
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
