// LoginScreen — Pantalla de inicio de sesión (Diseño Institucional Premium)
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config';

// ── Paleta guiada por la web (geovisor.css) ──────────────────────────────────
const C = {
  primary:      '#1B5E20',   // Verde oscuro institucional
  primaryMid:   '#2E7D32',
  primaryLight: '#4CAF50',
  primaryGlow:  'rgba(27,94,32,0.12)',
  bg:           '#F0F7F0',   // Fondo suave verde
  card:         '#FFFFFF',
  border:       '#C8E6C9',
  borderFocus:  '#1B5E20',
  inputBg:      '#FAFAFA',
  text:         '#1A1A1A',
  textMid:      '#4B5563',
  textLight:    '#9CA3AF',
  error:        '#D32F2F',
  errorBg:      '#FFEBEE',
  errorBorder:  '#FFCDD2',
  white:        '#FFFFFF',
  divider:      '#E0E0E0',
};

// ── Íconos SVG inline (sin emojis) ───────────────────────────────────────────
const IconMail = () => (
  <View style={icon.wrap}>
    {/* envelope outline */}
    <View style={icon.mailOuter}>
      <View style={icon.mailLine} />
    </View>
  </View>
);

// InputField con icono SVG pasado como children
const InputField = ({ label, error, iconName, rightSlot, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrapper}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputRow, focused && s.inputFocused, error && s.inputError]}>
        {/* Icono izquierdo vectorial */}
        <View style={s.inputIconWrap}>
          {iconName === 'mail'   && <MailIcon   />}
          {iconName === 'lock'   && <LockIcon   />}
        </View>
        <TextInput
          style={s.input}
          placeholderTextColor={C.textLight}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightSlot}
      </View>
      {error ? <Text style={s.errorText}>{error}</Text> : null}
    </View>
  );
};

// Icono de correo (puro View/StyleSheet — sin svg externo)
function MailIcon() {
  return (
    <View style={{ width: 20, height: 16, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        width: 20, height: 14, borderWidth: 1.5, borderColor: C.textLight,
        borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-start',
      }}>
        {/* línea diagonal del sobre */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          borderBottomWidth: 7, borderBottomColor: 'transparent',
          borderLeftWidth: 10, borderLeftColor: C.textLight,
          opacity: 0.35,
        }} />
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          borderBottomWidth: 7, borderBottomColor: 'transparent',
          borderRightWidth: 10, borderRightColor: C.textLight,
          opacity: 0.35,
        }} />
      </View>
    </View>
  );
}

function LockIcon() {
  return (
    <View style={{ width: 18, height: 20, alignItems: 'center' }}>
      {/* arco */}
      <View style={{
        width: 12, height: 7,
        borderTopLeftRadius: 6, borderTopRightRadius: 6,
        borderWidth: 1.8, borderBottomWidth: 0,
        borderColor: C.textLight, marginBottom: -1,
      }} />
      {/* cuerpo */}
      <View style={{
        width: 18, height: 12,
        backgroundColor: 'transparent',
        borderWidth: 1.8, borderColor: C.textLight,
        borderRadius: 3, alignItems: 'center', justifyContent: 'center',
      }}>
        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.textLight }} />
      </View>
    </View>
  );
}

function EyeIcon({ crossed }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: 18, height: 11,
        borderWidth: 1.5, borderColor: C.textMid,
        borderRadius: 9, overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.textMid }} />
      </View>
      {crossed && (
        <View style={{
          position: 'absolute', width: 22, height: 1.5,
          backgroundColor: C.textMid,
          transform: [{ rotate: '-35deg' }],
        }} />
      )}
    </View>
  );
}

// ── Pantalla Principal ────────────────────────────────────────────────────────
export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    const errs = {};
    if (!email.trim())              errs.email = 'Ingresa tu correo';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Correo inválido';
    if (!password)                  errs.password = 'Ingresa tu contraseña';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) { shake(); return; }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e) {
      shake();
      setErrors({
        general: e.message === 'Network request failed'
          ? 'No se puede conectar al servidor. Verifica tu red.'
          : e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── BANDA VERDE SUPERIOR ── */}
          <View style={s.topBand}>
            {/* Logos institucionales */}
            <View style={s.logosRow}>
              <Image
                source={require('../../assets/logo-alcaldia.png')}
                style={s.logoAlcaldia}
                resizeMode="contain"
              />
              <View style={s.logosDivider} />
              <Image
                source={require('../../assets/logo-unipiloto.png')}
                style={s.logoUnipiloto}
                resizeMode="contain"
              />
            </View>
            <Text style={s.systemTitle}>Observatorio de Transporte</Text>
            <Text style={s.systemSub}>Girardot · Cundinamarca</Text>
          </View>

          {/* ── TARJETA CENTRAL ── */}
          <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>

            <Text style={s.cardTitle}>Iniciar sesión</Text>
            <Text style={s.cardSub}>Accede con tu cuenta institucional</Text>

            {/* Error general */}
            {errors.general && (
              <View style={s.generalError}>
                <View style={s.errorDot} />
                <Text style={s.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* Correo */}
            <InputField
              label="Correo electrónico"
              iconName="mail"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: null, general: null })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            {/* Contraseña */}
            <InputField
              label="Contraseña"
              iconName="lock"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: null, general: null })); }}
              secureTextEntry={!showPass}
              error={errors.password}
              rightSlot={
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <EyeIcon crossed={showPass} />
                </TouchableOpacity>
              }
            />

            {/* Botón principal */}
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color={C.white} />
                : <Text style={s.btnText}>Entrar</Text>
              }
            </TouchableOpacity>

            {/* Link a registro */}
            <View style={s.registerRow}>
              <Text style={s.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>

          {/* Pie institucional */}
          <Text style={s.footer}>
            Secretaría de Tránsito y Transporte · 2026
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  // Banda superior verde
  topBand: {
    backgroundColor: C.primary,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  logoAlcaldia: {
    width: 130,
    height: 44,
  },
  logosDivider: {
    width: 1,
    height: 36,
    backgroundColor: C.divider,
  },
  logoUnipiloto: {
    width: 100,
    height: 44,
  },
  systemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  systemSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
    textAlign: 'center',
  },

  // Tarjeta blanca
  card: {
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 13.5,
    color: C.textMid,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Error general
  generalError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.errorBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.errorBorder,
    gap: 8,
  },
  errorDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.error, marginTop: 4,
  },
  generalErrorText: { flex: 1, color: C.error, fontSize: 13.5 },

  // Inputs
  fieldWrapper: { marginBottom: 16 },
  label: {
    fontSize: 13, fontWeight: '600',
    color: C.text, marginBottom: 7,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.inputBg,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  inputFocused: { borderColor: C.borderFocus, backgroundColor: C.white },
  inputError:   { borderColor: C.error },
  inputIconWrap: { width: 22, alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: C.text },
  eyeBtn: { padding: 2 },
  errorText: { fontSize: 12, color: C.error, marginTop: 4, marginLeft: 2 },

  // Botón principal
  btn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Link registro
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  registerText: { fontSize: 14, color: C.textMid },
  registerLink: { fontSize: 14, color: C.primary, fontWeight: '700' },

  // Pie
  footer: {
    fontSize: 11.5,
    color: C.textLight,
    textAlign: 'center',
    marginTop: 28,
    paddingHorizontal: 24,
  },
});

const icon = StyleSheet.create({
  wrap: { width: 22, alignItems: 'center', justifyContent: 'center' },
});
