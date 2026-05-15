// GeovisorScreen — Embebe el mapa web de Laravel en un WebView nativo
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { GEOVISOR_URL, COLORS } from '../config';

// ── Paleta institucional ──────────────────────────────────────────────────────
const C = {
  primary:     '#1B5E20',
  primaryMid:  '#2E7D32',
  headerText:  '#FFFFFF',
  logoutBg:    'rgba(255,255,255,0.15)',
  logoutBorder:'rgba(255,255,255,0.35)',
};

export default function GeovisorScreen() {
  const { token, signOut } = useAuth();
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // ── JS PRE-CARGA: Se ejecuta ANTES de que cargue el HTML ──────────────────────
  // Sobrescribe navigator.geolocation de inmediato para que NINGÚN script use la API web nativa
  const injectedBeforeContentLoaded = `
    (function() {
      window.__isNativeApp__ = true;

      // Sobrescribir geolocation
      var nativeGeo = {
        getCurrentPosition: function(success, error, options) {
          window.__geoSuccessCallback = success;
          window.__geoErrorCallback = error;
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'REQUEST_LOCATION', options: options })
          );
        },
        watchPosition: function(success, error, options) {
          window.__geoSuccessCallback = success;
          window.__geoErrorCallback = error;
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'REQUEST_LOCATION', options: options })
          );
          return 12345; // fake ID
        },
        clearWatch: function(id) {
          // nada que hacer
        }
      };

      Object.defineProperty(navigator, 'geolocation', {
        value: nativeGeo,
        configurable: false,
        writable: false
      });

      true;
    })();
  `;

  // ── JS POST-CARGA: Estilos y validaciones Leaflet ──────────────────────────────
  const injectedJS = `
    (function() {
      // 1. CSS: forzar que el mapa llene toda la pantalla
      var style = document.createElement('style');
      style.textContent = \`
        html, body {
          height: 100% !important;
          overflow: hidden !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #geovisor-root {
          height: 100vh !important;
          height: 100dvh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
        }
        .geovisor-workspace {
          flex: 1 !important;
          min-height: 0 !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        .geovisor-main {
          flex: 1 !important;
          min-height: 0 !important;
          height: 100% !important;
          position: relative !important;
          overflow: hidden !important;
        }
        #geovisor-map {
          height: 100% !important;
          width: 100% !important;
          position: absolute !important;
          inset: 0 !important;
        }
        .geovisor-header,
        .geovisor-mobile-menu,
        #btn-hamburger { display: none !important; }
      \`;
      document.head.appendChild(style);

      // 2. Token para el backend web
      window.__APP_TOKEN__ = "${token}";
      sessionStorage.setItem('mobile_token', "${token}");
      sessionStorage.setItem('is_mobile_app', 'true');

      // 3. PWA banner → ocultar
      var pwaBanner = document.getElementById('pwa-banner');
      if (pwaBanner) pwaBanner.style.display = 'none';

      // 4. Notificar que es app nativa
      window.dispatchEvent(new CustomEvent('mobileApp:ready', { detail: { token: "${token}" } }));

      // 5. Recalcular Leaflet
      function invalidateMap() {
        window.dispatchEvent(new Event('resize'));
        var mapDiv = document.getElementById('geovisor-map');
        if (mapDiv) {
          for (var key in mapDiv) {
            if (key.startsWith('_leaflet') && mapDiv[key] && mapDiv[key].invalidateSize) {
              mapDiv[key].invalidateSize(true);
              break;
            }
          }
        }
      }
      setTimeout(invalidateMap, 500);
      setTimeout(invalidateMap, 1200);
      setTimeout(invalidateMap, 2500);

      // Escuchar coordenadas enviadas por React Native
      window.addEventListener('nativeLocation', function(e) {
        var coords = e.detail;
        
        // Disparar callback que interceptamos de navigator.geolocation
        if (window.__geoSuccessCallback) {
          window.__geoSuccessCallback({
            coords: {
              latitude:  coords.latitude,
              longitude: coords.longitude,
              accuracy:  coords.accuracy || 10,
              altitude: 0,
              altitudeAccuracy: 0,
              heading: 0,
              speed: 0
            },
            timestamp: Date.now()
          });
        }
        
        // También notificar al mapa Leaflet si está inicializado
        var mapDiv = document.getElementById('geovisor-map');
        if (mapDiv) {
          for (var key in mapDiv) {
            if (key.startsWith('_leaflet') && mapDiv[key] && mapDiv[key].fire) {
              var map = mapDiv[key];
              // Forzamos a Leaflet a disparar su evento interno 'locationfound'
              map.fire('locationfound', {
                latlng: { lat: coords.latitude, lng: coords.longitude },
                accuracy: coords.accuracy || 10,
                bounds: null
              });
              // Centrar en Girardot/Usuario
              map.setView([coords.latitude, coords.longitude], 15);
              break;
            }
          }
        }
      });

      // Interceptar el error si ocurre nativamente
      window.addEventListener('nativeLocationError', function(e) {
        if (window.__geoErrorCallback) {
          window.__geoErrorCallback({
            code: 1,
            message: e.detail.message || 'Permiso denegado'
          });
        }
      });

      true;
    })();
  `;

  // ── Mensajes entrantes del WebView → React Native ─────────────────────────
  const handleMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // GPS: el mapa web solicita la ubicación del dispositivo
      if (data.type === 'REQUEST_LOCATION') {
        // 1. Solicitar permisos
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          status = req.status;
        }

        if (status === 'granted') {
          // Verificar si los servicios de ubicación están habilitados
          const enabled = await Location.hasServicesEnabledAsync();
          if (!enabled) {
            Alert.alert(
              'Servicios de ubicación desactivados',
              'Activa la ubicación en los ajustes rápidos de Android (desliza desde la parte superior de la pantalla y toca el ícono de Ubicación).',
              [{ text: 'Entendido' }]
            );
            webViewRef.current?.injectJavaScript(`
              window.dispatchEvent(new CustomEvent('nativeLocationError', { detail: { message: 'Servicios de ubicación desactivados' } }));
              true;
            `);
            return;
          }

          let loc = null;
          try {
            // Intentar primero la última posición conocida (instantáneo, sin necesidad de fix GPS)
            loc = await Location.getLastKnownPositionAsync({ maxAge: 60000 });
          } catch (_) {}

          if (!loc) {
            try {
              // Si no hay posición conocida, pedir una nueva con baja precisión (más rápido)
              loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low,
              });
            } catch (gpsErr) {
              console.warn('[GPS] Error al obtener posición:', gpsErr.message);
              Alert.alert(
                'No se pudo obtener la ubicación',
                'Asegúrate de que el GPS esté activado en los Ajustes Rápidos de Android y vuelve a intentarlo.',
                [{ text: 'Entendido' }]
              );
              webViewRef.current?.injectJavaScript(`
                window.dispatchEvent(new CustomEvent('nativeLocationError', { detail: { message: 'GPS no disponible' } }));
                true;
              `);
              return;
            }
          }

          if (loc) {
            const js = `
              window.dispatchEvent(new CustomEvent('nativeLocation', {
                detail: {
                  latitude:  ${loc.coords.latitude},
                  longitude: ${loc.coords.longitude},
                  accuracy:  ${loc.coords.accuracy || 50}
                }
              }));
              true;
            `;
            webViewRef.current?.injectJavaScript(js);
          }
        } else {
          Alert.alert(
            'Permiso de ubicación',
            'Para ver paraderos cercanos, activa el acceso a la ubicación en la configuración de la App.',
            [{ text: 'Entendido' }]
          );
          webViewRef.current?.injectJavaScript(`
            window.dispatchEvent(new CustomEvent('nativeLocationError', { detail: { message: 'Permiso denegado' } }));
            true;
          `);
        }
      }

      // Logout
      if (data.type === 'LOGOUT') {
        confirmLogout();
      }
    } catch (_) {}
  }, [token]);

  // ── Cerrar sesión con confirmación ────────────────────────────────────────
  const confirmLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  // ── Toggle del panel de rutas ─────────────────────────────────────────────
  const toggleLayersPanel = () => {
    webViewRef.current?.injectJavaScript(`
      (function() {
        var btn = document.getElementById('btn-toggle-layers');
        if (btn) btn.click();
        return true;
      })();
    `);
  };

  // ── Pantalla de error ─────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={st.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={st.header}>
          <Text style={st.headerTitle}>Geovisor de Rutas</Text>
          <TouchableOpacity style={st.logoutBtn} onPress={confirmLogout}>
            <Text style={st.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
        <View style={st.errorContainer}>
          <View style={st.errorIconWrap}>
            <View style={st.errorIconBar1} />
            <View style={st.errorIconBar2} />
            <View style={st.errorIconBar3} />
          </View>
          <Text style={st.errorTitle}>Sin conexión al servidor</Text>
          <Text style={st.errorMsg}>
            Asegúrate de estar conectado a la red y de que el servidor esté disponible.
          </Text>
          <TouchableOpacity style={st.reloadBtn} onPress={() => { setError(false); setLoading(true); webViewRef.current?.reload(); }}>
            <Text style={st.reloadText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── HEADER NATIVO ── */}
      <View style={st.header}>
        <TouchableOpacity style={st.menuBtn} onPress={toggleLayersPanel} activeOpacity={0.75}>
          <View style={st.menuLine} />
          <View style={[st.menuLine, { width: 14 }]} />
          <View style={st.menuLine} />
        </TouchableOpacity>

        <Text style={st.headerTitle}>Geovisor de Rutas</Text>

        <TouchableOpacity style={st.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <Text style={st.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* ── WEBVIEW ── */}
      <View style={st.webViewContainer}>
        {loading && (
          <View style={st.loadingOverlay}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={st.loadingText}>Cargando mapa...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          style={st.webView}
          injectedJavaScriptBeforeContentLoaded={injectedBeforeContentLoaded}
          injectedJavaScript={injectedJS}
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled={false} // Desactivamos el de la webview nativa para que use el de Expo 100%
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          allowFileAccess
          originWhitelist={['*']}
          source={{
            uri: GEOVISOR_URL,
            headers: {
              Authorization: `Bearer ${token}`,
              'X-App-Client': 'ObservatorioMovil/1.0 Android',
            },
          }}
          onLoadStart={() => { setLoading(true);  setError(false); }}
          onLoadEnd={()   =>   setLoading(false)}
          onError={()     => { setLoading(false);  setError(true);  }}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode >= 500) { setLoading(false); setError(true); }
          }}
          onMessage={handleMessage}
          applicationNameForUserAgent="ObservatorioMovil/1.0"
        />
      </View>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  header: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 52,
    gap: 10,
  },
  menuBtn: {
    width: 36, height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 4,
  },
  menuLine: {
    width: 20, height: 2,
    backgroundColor: C.headerText,
    borderRadius: 2,
  },
  headerTitle: {
    flex: 1,
    color: C.headerText,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  logoutBtn: {
    backgroundColor: C.logoutBg,
    borderWidth: 1,
    borderColor: C.logoutBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutText: {
    color: C.headerText,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  webViewContainer: { flex: 1, position: 'relative' },
  webView: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F7F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    gap: 14,
  },
  loadingText: { fontSize: 15, color: '#4B5563' },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
    backgroundColor: '#F0F7F0',
  },
  errorIconWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 4,
    opacity: 0.4,
  },
  errorIconBar1: { width: 6, height: 12, borderRadius: 3, backgroundColor: C.primary },
  errorIconBar2: { width: 6, height: 20, borderRadius: 3, backgroundColor: C.primary },
  errorIconBar3: { width: 6, height: 28, borderRadius: 3, backgroundColor: C.primary },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  errorMsg:   { fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 22 },
  reloadBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 13,
    marginTop: 6,
  },
  reloadText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
