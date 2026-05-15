// Servicio de API — usa Bearer token para la app móvil
// El backend detecta el header X-App-Client y devuelve un token en el login
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

const TOKEN_KEY = '@observatorio_token';
const USER_KEY  = '@observatorio_user';

// ─── Helpers de storage ───────────────────────────────────────────────────────
export const saveToken   = (t) => AsyncStorage.setItem(TOKEN_KEY, t);
export const getToken    = ()  => AsyncStorage.getItem(TOKEN_KEY);
export const saveUser    = (u) => AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
export const getUser     = async () => { const r = await AsyncStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; };
export const clearSession = () => AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

// ─── Helper de fetch ──────────────────────────────────────────────────────────
const apiFetch = async (endpoint, options = {}) => {
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    // Este header le dice al backend que somos la app móvil → devuelve Bearer token
    'X-App-Client': 'ObservatorioMovil/1.0 Android',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

// ─── Autenticación ────────────────────────────────────────────────────────────

/**
 * Login — devuelve { message, token, user } cuando viene de la app móvil
 */
export const login = async (email, password) => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Credenciales incorrectas');
  }

  // Guardar token y usuario
  if (data.token) await saveToken(data.token);
  if (data.user)  await saveUser(data.user);

  return data;
};

/**
 * Registro — luego hace login automático
 */
export const register = async (userData) => {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
    }
    throw new Error(data.message || 'Error al crear la cuenta');
  }

  return data; // { message: 'Usuario registrado exitosamente' }
};

/**
 * Datos del usuario autenticado — para verificar sesión al inicio
 */
export const getMe = async () => {
  const response = await apiFetch('/auth/me');

  if (response.status === 401) throw new Error('Sesión expirada');
  if (!response.ok) throw new Error('Error al obtener el usuario');

  return response.json();
};

/**
 * Logout — revoca el token en el servidor
 */
export const logout = async () => {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (e) {
    console.warn('Logout request failed:', e.message);
  } finally {
    await clearSession();
  }
};

/**
 * Solicitar código de recuperación de contraseña
 */
export const forgotPassword = async (email) => {
  const response = await apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al solicitar el código de recuperación');
  }
  return data;
};

/**
 * Restablecer contraseña con el código
 */
export const resetPassword = async (email, token, password, password_confirmation) => {
  const response = await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, password, password_confirmation }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al restablecer la contraseña');
  }
  return data;
};
