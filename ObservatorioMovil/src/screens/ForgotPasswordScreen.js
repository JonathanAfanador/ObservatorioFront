// ForgotPasswordScreen — Flujo de recuperación de contraseña en 2 pasos
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
import { forgotPassword, resetPassword } from '../services/api';

const C = {
  primary:      '#1B5E20',
  primaryMid:   '#2E7D32',
  primaryLight: '#4CAF50',
  bg:           '#F0F7F0',
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
  success:      '#2E7D32',
  successBg:    '#E8F5E9',
  successBorder:'#C8E6C9',
  white:        '#FFFFFF',
  divider:      '#E0E0E0',
};

// Íconos SVG inline (reutilizados del Login)
const InputField = ({ label, error, iconName, rightSlot, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrapper}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputRow, focused && s.inputFocused, error && s.inputError]}>
        <View style={s.inputIconWrap}>
          {iconName === 'mail' && <MailIcon />}
          {iconName === 'lock' && <LockIcon />}
          {iconName === 'key'  && <KeyIcon />}
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

function MailIcon() {
  return (
    <View style={{ width: 20, height: 16, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 20, height: 14, borderWidth: 1.5, borderColor: C.textLight, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-start' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, borderBottomWidth: 7, borderBottomColor: 'transparent', borderLeftWidth: 10, borderLeftColor: C.textLight, opacity: 0.35 }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, borderBottomWidth: 7, borderBottomColor: 'transparent', borderRightWidth: 10, borderRightColor: C.textLight, opacity: 0.35 }} />
      </View>
    </View>
  );
}

function LockIcon() {
  return (
    <View style={{ width: 18, height: 20, alignItems: 'center' }}>
      <View style={{ width: 12, height: 7, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderWidth: 1.8, borderBottomWidth: 0, borderColor: C.textLight, marginBottom: -1 }} />
      <View style={{ width: 18, height: 12, backgroundColor: 'transparent', borderWidth: 1.8, borderColor: C.textLight, borderRadius: 3, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.textLight }} />
      </View>
    </View>
  );
}

function KeyIcon() {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: C.textLight }} />
      <View style={{ width: 10, height: 1.5, backgroundColor: C.textLight }} />
      <View style={{ position: 'absolute', right: 2, top: 12, width: 1.5, height: 4, backgroundColor: C.textLight }} />
      <View style={{ position: 'absolute', right: 5, top: 12, width: 1.5, height: 3, backgroundColor: C.textLight }} />
    </View>
  );
}

function EyeIcon({ crossed }) {
  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18, height: 11, borderWidth: 1.5, borderColor: C.textMid, borderRadius: 9, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.textMid }} />
      </View>
      {crossed && <View style={{ position: 'absolute', width: 22, height: 1.5, backgroundColor: C.textMid, transform: [{ rotate: '-35deg' }] }} />}
    </View>
  );
}

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleSendCode = async () => {
    setErrors({});
    setSuccessMsg('');
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Ingresa un correo válido' });
      shake();
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setStep(2);
    } catch (e) {
      shake();
      setErrors({ general: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setErrors({});
    let errs = {};
    if (!token || token.length !== 6) errs.token = 'El código debe ser de 6 dígitos';
    if (!password || password.length < 8) errs.password = 'Mínimo 8 caracteres';
    if (password !== confirmPass) errs.confirmPass = 'Las contraseñas no coinciden';
    
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      shake();
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase(), token, password, confirmPass);
      setSuccessMsg('¡Contraseña actualizada con éxito!');
      setTimeout(() => {
        navigation.navigate('Login', { status: 'password_reset' });
      }, 2000);
    } catch (e) {
      shake();
      setErrors({ general: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={s.topBand}>
            <View style={s.logosRow}>
              <Image source={require('../../assets/logo-alcaldia.png')} style={s.logoAlcaldia} resizeMode="contain" />
              <View style={s.logosDivider} />
              <Image source={require('../../assets/logo-unipiloto.png')} style={s.logoUnipiloto} resizeMode="contain" />
            </View>
            <Text style={s.systemTitle}>Recuperar Contraseña</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Text style={s.backBtnText}>← Volver al inicio de sesión</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[s.card, { transform: [{ translateX: shakeAnim }] }]}>
            
            {errors.general && (
              <View style={s.generalError}>
                <View style={s.errorDot} />
                <Text style={s.generalErrorText}>{errors.general}</Text>
              </View>
            )}
            
            {successMsg ? (
              <View style={s.successBox}>
                <Text style={s.successText}>{successMsg}</Text>
              </View>
            ) : null}

            {step === 1 && (
              <View>
                <Text style={s.cardSub}>Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.</Text>
                
                <InputField
                  label="Correo electrónico"
                  iconName="mail"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors({}); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                />

                <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleSendCode} disabled={loading}>
                  {loading ? <ActivityIndicator color={C.white} /> : <Text style={s.btnText}>Enviar código</Text>}
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={s.cardSub}>Enviamos un código de 6 dígitos a tu correo. Ingrésalo junto con tu nueva contraseña.</Text>
                
                <InputField
                  label="Código de verificación"
                  iconName="key"
                  placeholder="123456"
                  value={token}
                  onChangeText={(t) => { setToken(t.replace(/[^0-9]/g, '')); setErrors({}); }}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={errors.token}
                />

                <InputField
                  label="Nueva contraseña"
                  iconName="lock"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors({}); }}
                  secureTextEntry={!showPass}
                  error={errors.password}
                  rightSlot={
                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                      <EyeIcon crossed={showPass} />
                    </TouchableOpacity>
                  }
                />

                <InputField
                  label="Confirmar contraseña"
                  iconName="lock"
                  placeholder="Repite la contraseña"
                  value={confirmPass}
                  onChangeText={(t) => { setConfirmPass(t); setErrors({}); }}
                  secureTextEntry={!showPass}
                  error={errors.confirmPass}
                />

                <TouchableOpacity style={[s.btn, loading && s.btnDisabled]} onPress={handleReset} disabled={loading || !!successMsg}>
                  {loading ? <ActivityIndicator color={C.white} /> : <Text style={s.btnText}>Cambiar contraseña</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={s.resendBtn} onPress={() => setStep(1)} disabled={loading || !!successMsg}>
                  <Text style={s.resendText}>¿No recibiste el código? Reenviar</Text>
                </TouchableOpacity>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  topBand: { backgroundColor: C.primary, paddingTop: 36, paddingBottom: 40, alignItems: 'center', paddingHorizontal: 24 },
  logosRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, gap: 16, marginBottom: 20, elevation: 5 },
  logoAlcaldia: { width: 130, height: 44 },
  logosDivider: { width: 1, height: 36, backgroundColor: C.divider },
  logoUnipiloto: { width: 100, height: 44 },
  systemTitle: { fontSize: 18, fontWeight: '700', color: C.white, letterSpacing: 0.3, textAlign: 'center' },
  backBtn: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  backBtnText: { color: C.white, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: C.card, marginHorizontal: 20, marginTop: -20, borderRadius: 20, padding: 28, elevation: 8 },
  cardSub: { fontSize: 13.5, color: C.textMid, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  generalError: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.errorBg, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.errorBorder, gap: 8 },
  errorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.error, marginTop: 4 },
  generalErrorText: { flex: 1, color: C.error, fontSize: 13.5 },
  successBox: { backgroundColor: C.successBg, borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: C.successBorder, alignItems: 'center' },
  successText: { color: C.success, fontSize: 14, fontWeight: '600' },
  fieldWrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 7 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 12, backgroundColor: C.inputBg, paddingHorizontal: 14, height: 52, gap: 10 },
  inputFocused: { borderColor: C.borderFocus, backgroundColor: C.white },
  inputError: { borderColor: C.error },
  inputIconWrap: { width: 22, alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: C.text },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: C.error, marginTop: 4, marginLeft: 2 },
  btn: { backgroundColor: C.primary, borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 7 },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: C.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.4 },
  resendBtn: { marginTop: 24, alignItems: 'center', paddingVertical: 8 },
  resendText: { color: C.primary, fontSize: 14, fontWeight: '600' },
});
