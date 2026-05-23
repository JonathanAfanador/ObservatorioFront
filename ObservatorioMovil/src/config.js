// Configuración central de la app
// En desarrollo local: usa la IP de tu PC en la red local
// En producción: cambia a tu dominio real

// Para Expo Go / emulador Android usa tu IP local (ej: 192.168.1.50)
// Para emulador Android Studio usa: 10.0.2.2 (apunta a localhost del PC)
// const DEV_URL = 'http://10.0.2.2:8000'; // Emulador Android Studio (solo cuando no usas celular físico)
const DEV_URL = 'http://192.168.1.41:8000'; // Celular físico en la misma red WiFi
const PROD_URL = 'https://semillero-desarrollo-production.up.railway.app'; // (PRODUCCIÓN) Dominio expuesto en Railway

export const API_BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

// URL del geovisor móvil — sin navbar ni footer (solo el mapa)
export const GEOVISOR_URL = `${API_BASE_URL}/geovisor/mobile`;

// Colores institucionales
export const COLORS = {
  primary: '#1B5E20',        // Verde oscuro institucional
  primaryLight: '#2E7D32',   // Verde medio
  primarySoft: '#E8F5E9',    // Verde muy suave (fondos)
  accent: '#4CAF50',         // Verde brillante (botones)
  white: '#FFFFFF',
  background: '#F5F5F5',
  textDark: '#1A1A1A',
  textMedium: '#555555',
  textLight: '#888888',
  border: '#E0E0E0',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  inputBg: '#FAFAFA',
};

// Tipografías (se usan con expo-font)
export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};
