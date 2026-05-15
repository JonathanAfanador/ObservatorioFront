// SplashScreen — Pantalla de bienvenida institucional profesional
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Paleta institucional
const C = {
  bg:          '#0D2B14',   // Verde oscuro profundo
  bgCard:      '#122E1A',   // Verde oscuro ligeramente más claro para la card
  accent:      '#4CAF50',   // Verde vibrante para el acento
  accentSoft:  '#2E7D32',
  white:       '#FFFFFF',
  textSub:     'rgba(255,255,255,0.65)',
  textMuted:   'rgba(255,255,255,0.38)',
  divider:     'rgba(255,255,255,0.12)',
  progressBg:  'rgba(255,255,255,0.10)',
};

export default function SplashScreen() {
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const slideAnim    = useRef(new Animated.Value(30)).current;
  const logoFade     = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.88)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const lineScale    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo entra con spring
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1, friction: 6, tension: 80, useNativeDriver: true,
      }),
    ]).start();

    // 2. Texto sube con delay
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 550, delay: 300, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 550, delay: 300, useNativeDriver: true,
      }),
    ]).start();

    // 3. Línea separadora aparece
    Animated.timing(lineScale, {
      toValue: 1, duration: 400, delay: 550, useNativeDriver: true,
    }).start();

    // 4. Barra de progreso al final
    Animated.timing(progressAnim, {
      toValue: 1, duration: 2000, delay: 200, useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Círculo decorativo de fondo (sutil) */}
      <View style={styles.decorCircleLg} />
      <View style={styles.decorCircleSm} />

      {/* ── CONTENIDO CENTRAL ── */}
      <View style={styles.centerBlock}>

        {/* Logo de la app */}
        <Animated.View style={[
          styles.appLogoWrap,
          { opacity: logoFade, transform: [{ scale: logoScale }] }
        ]}>
          {/* Escudo: composición limpia sin emojis */}
          <View style={styles.shieldOuter}>
            <View style={styles.shieldInner}>
              {/* Mapa — punto + onda */}
              <View style={styles.mapDot} />
              <View style={styles.mapRing1} />
              <View style={styles.mapRing2} />
            </View>
          </View>
        </Animated.View>

        {/* Título y subtítulo */}
        <Animated.View style={[
          styles.textBlock,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <Text style={styles.appName}>Observatorio</Text>
          <Text style={styles.appNameLight}>de Transporte Público</Text>
          <Text style={styles.appSub}>Secretaría de Tránsito y Transporte{'\n'}Girardot, Cundinamarca</Text>
        </Animated.View>

        {/* Línea divisoria + logos institucionales */}
        <Animated.View style={[
          styles.logosCard,
          { opacity: fadeAnim }
        ]}>
          <View style={styles.dividerLine} />

          <View style={styles.logosRow}>
            {/* Alcaldía */}
            <View style={styles.logoItem}>
              <Image
                source={require('../../assets/logo-alcaldia.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
              <Text style={styles.logoCaption}>Alcaldía de Girardot</Text>
            </View>

            {/* Separador vertical */}
            <View style={styles.logoDivider} />

            {/* UniPiloto */}
            <View style={styles.logoItem}>
              <Image
                source={require('../../assets/logo-unipiloto.png')}
                style={styles.logoImgWide}
                resizeMode="contain"
              />
              <Text style={styles.logoCaption}>U. Piloto{'\n'}Seccional Alto Magdalena</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* ── BARRA DE PROGRESO INFERIOR ── */}
      <View style={styles.bottomBar}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingText}>Iniciando aplicación...</Text>
      </View>
    </View>
  );
}

const SHIELD = 88;
const INNER  = 62;
const DOT    = 10;
const RING1  = 24;
const RING2  = 42;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Decoración de fondo ──
  decorCircleLg: {
    position: 'absolute',
    top: -height * 0.12,
    right: -width * 0.25,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(76,175,80,0.06)',
  },
  decorCircleSm: {
    position: 'absolute',
    bottom: height * 0.12,
    left: -width * 0.18,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(76,175,80,0.05)',
  },

  // ── Bloque central ──
  centerBlock: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  // ── Escudo del app ──
  appLogoWrap: {
    marginBottom: 32,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  shieldOuter: {
    width: SHIELD,
    height: SHIELD,
    borderRadius: SHIELD / 2,
    backgroundColor: C.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldInner: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Pin de mapa: punto central + anillos
  mapDot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: C.bg,
  },
  mapRing1: {
    position: 'absolute',
    width: RING1,
    height: RING1,
    borderRadius: RING1 / 2,
    borderWidth: 2.5,
    borderColor: 'rgba(13,43,20,0.55)',
  },
  mapRing2: {
    position: 'absolute',
    width: RING2,
    height: RING2,
    borderRadius: RING2 / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(13,43,20,0.25)',
  },

  // ── Textos ──
  textBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appNameLight: {
    fontSize: 18,
    fontWeight: '300',
    color: C.accent,
    letterSpacing: 0.2,
    textAlign: 'center',
    marginBottom: 12,
  },
  appSub: {
    fontSize: 12.5,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 19,
    letterSpacing: 0.1,
  },

  // ── Card de logos ──
  logosCard: {
    alignItems: 'center',
    gap: 20,
  },
  dividerLine: {
    width: 48,
    height: 1,
    backgroundColor: C.divider,
    marginBottom: 4,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.divider,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 20,
  },
  logoItem: {
    alignItems: 'center',
    gap: 6,
    maxWidth: width * 0.27,
  },
  logoImg: {
    width: 52,
    height: 44,
  },
  logoImgWide: {
    width: 68,
    height: 44,
  },
  logoCaption: {
    fontSize: 9.5,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 13,
    fontWeight: '500',
  },
  logoDivider: {
    width: 1,
    height: 52,
    backgroundColor: C.divider,
  },

  // ── Barra inferior ──
  bottomBar: {
    position: 'absolute',
    bottom: 52,
    width: width * 0.52,
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: C.progressBg,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.accent,
    borderRadius: 1,
  },
  loadingText: {
    fontSize: 11,
    color: C.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
