// SplashScreen — Pantalla de bienvenida con logo y barra de carga
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS } from '../config';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Animación de entrada: fade + scale del logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Barra de progreso
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Fondo con gradiente suave simulado */}
      <View style={styles.bgTop} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Ícono principal */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconContainer}>
            {/* Bus SVG simulado con elementos RN */}
            <Text style={styles.busEmoji}>🚌</Text>
          </View>
        </View>

        {/* Títulos */}
        <Text style={styles.title}>Observatorio de{'\n'}Transporte Público</Text>
        <Text style={styles.subtitle}>
          Secretaría de Tránsito y Transporte{'\n'}Girardot, Cundinamarca
        </Text>

        {/* Logos institucionales */}
        <View style={styles.logosRow}>
          {/* Alcaldía de Girardot */}
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>🏛️ Alcaldía de{'\n'}Girardot</Text>
          </View>
          <View style={styles.logoDivider} />
          {/* UniPiloto */}
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>🎓 U Piloto{'\n'}Seccional Alto Magdalena</Text>
          </View>
        </View>
      </Animated.View>

      {/* Barra de carga */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.loadingText}>Cargando aplicación...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 28,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  busEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13.5,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  logoBox: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 11,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '600',
  },
  logoDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 64,
    width: width * 0.55,
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#D4E8D4',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textLight,
    letterSpacing: 0.3,
  },
});
