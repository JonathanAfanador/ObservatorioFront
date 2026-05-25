// RegisterScreen — Pantalla de registro (Diseño Institucional Premium)
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Modal, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config';

// ── Paleta institucional (igual que LoginScreen) ──────────────────────────────
const C = {
  primary:      '#1B5E20',
  primaryMid:   '#2E7D32',
  primaryLight: '#4CAF50',
  primaryGlow:  'rgba(27,94,32,0.12)',
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
  white:        '#FFFFFF',
  divider:      '#E0E0E0',
  softGreen:    '#E8F5E9',
};

// ── Datos del backend ─────────────────────────────────────────────────────────
const GENERO_OPTIONS   = [
  { label: 'Masculino', value: 'Hombre' },
  { label: 'Femenino',  value: 'Mujer'  },
];
const TIPO_IDENT_DEFAULT = 1;

// ── Íconos vectoriales (View/StyleSheet) ─────────────────────────────────────
function ChevronDownIcon() {
  return (
    <View style={{ width: 16, height: 10, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 10, height: 10, borderRightWidth: 2, borderBottomWidth: 2, borderColor: C.textLight, transform: [{ rotate: '45deg' }, { translateY: -3 }] }} />
    </View>
  );
}

function CheckIcon() {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 10, height: 6, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: C.primary, transform: [{ rotate: '-45deg' }, { translateY: -2 }] }} />
    </View>
  );
}

// ── Componentes reutilizables ─────────────────────────────────────────────────
const StyledInput = ({ error, style, half, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[
        s.input,
        focused && s.inputFocused,
        error   && s.inputError,
        half    && { flex: 1 },
        style,
      ]}
      placeholderTextColor={C.textLight}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
};

const Field = ({ label, error, children, flex }) => (
  <View style={[s.fieldWrapper, flex && { flex: 1 }]}>
    <Text style={s.label}>{label}</Text>
    {children}
    {error ? <Text style={s.errorText}>{error}</Text> : null}
  </View>
);

// ── Pantalla Principal ────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    nui: '', name: '', last_name: '', email: '',
    gender: '', phone_number: '', password: '', password_confirmation: '',
  });
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null, general: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nui.trim())       errs.nui       = 'Requerido';
    if (!form.name.trim())      errs.name      = 'Requerido';
    if (!form.last_name.trim()) errs.last_name = 'Requerido';
    if (!form.email.trim())     errs.email     = 'Ingresa tu correo';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo inválido';
    if (!form.gender)           errs.gender    = 'Selecciona una opción';
    if (!form.password)         errs.password  = 'Mín. 6 caracteres';
    else if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = 'Las contraseñas no coinciden';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp({
        nui:                  form.nui.trim(),
        name:                 form.name.trim(),
        last_name:            form.last_name.trim(),
        email:                form.email.trim().toLowerCase(),
        gender:               form.gender,
        tipo_ident_id:        TIPO_IDENT_DEFAULT,
        phone_number:         form.phone_number.trim() || null,
        password:             form.password,
        password_confirmation: form.password_confirmation,
      });
    } catch (e) {
      setErrors({ general: e.message });
    } finally {
      setLoading(false);
    }
  };

  const selectedGenderLabel =
    GENERO_OPTIONS.find((o) => o.value === form.gender)?.label || 'Seleccione...';

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
            <Text style={s.systemTitle}>Registro de Usuario</Text>
            <Text style={s.systemSub}>Crea tu cuenta institucional</Text>
          </View>

          {/* ── TARJETA CENTRAL ── */}
          <View style={s.card}>

            {/* Error general */}
            {errors.general && (
              <View style={s.generalError}>
                <View style={s.errorDot} />
                <Text style={s.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* ─ Sección: Identificación ─ */}
            <Text style={s.sectionTitle}>Identificación</Text>

            <Field label="Número de identificación" error={errors.nui}>
              <StyledInput
                placeholder="Ej: 1070586623"
                value={form.nui}
                onChangeText={(t) => update('nui', t)}
                keyboardType="numeric"
                error={errors.nui}
              />
            </Field>

            <View style={s.row}>
              <Field label="Nombres" error={errors.name} flex>
                <StyledInput
                  placeholder="Juan Pablo"
                  value={form.name}
                  onChangeText={(t) => update('name', t)}
                  error={errors.name}
                />
              </Field>
              <View style={{ width: 12 }} />
              <Field label="Apellidos" error={errors.last_name} flex>
                <StyledInput
                  placeholder="Medina"
                  value={form.last_name}
                  onChangeText={(t) => update('last_name', t)}
                  error={errors.last_name}
                />
              </Field>
            </View>

            {/* ─ Sección: Contacto ─ */}
            <Text style={s.sectionTitle}>Contacto</Text>

            <Field label="Correo electrónico" error={errors.email}>
              <StyledInput
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChangeText={(t) => update('email', t)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
            </Field>

            <Field label="Teléfono" error={errors.phone_number}>
              <StyledInput
                placeholder="Ej: 3001234567"
                value={form.phone_number}
                onChangeText={(t) => update('phone_number', t)}
                keyboardType="phone-pad"
              />
            </Field>

            {/* Sexo Biológico */}
            <Field label="Sexo Biológico" error={errors.gender}>
              <TouchableOpacity
                style={[s.pickerBtn, errors.gender && s.inputError]}
                onPress={() => setShowGenderPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[s.pickerText, !form.gender && s.pickerPlaceholder]}>
                  {selectedGenderLabel}
                </Text>
                <ChevronDownIcon />
              </TouchableOpacity>
            </Field>

            {/* ─ Sección: Seguridad ─ */}
            <Text style={s.sectionTitle}>Seguridad</Text>

            <Field label="Contraseña" error={errors.password}>
              <StyledInput
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChangeText={(t) => update('password', t)}
                secureTextEntry
                error={errors.password}
              />
            </Field>

            <Field label="Confirmar contraseña" error={errors.password_confirmation}>
              <StyledInput
                placeholder="Repetir contraseña"
                value={form.password_confirmation}
                onChangeText={(t) => update('password_confirmation', t)}
                secureTextEntry
                error={errors.password_confirmation}
              />
            </Field>

            {/* Botón */}
            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color={C.white} />
                : <Text style={s.btnText}>Crear cuenta</Text>
              }
            </TouchableOpacity>

            <View style={s.loginRow}>
              <Text style={s.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>

          </View>

          <Text style={s.footer}>Secretaría de Tránsito y Transporte · 2026</Text>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MODAL GÉNERO ── */}
      <Modal
        visible={showGenderPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderPicker(false)}
        >
          <View style={s.modalBox}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Seleccionar sexo biológico</Text>
            {GENERO_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[s.modalOption, form.gender === opt.value && s.modalOptionSelected]}
                onPress={() => { update('gender', opt.value); setShowGenderPicker(false); }}
              >
                <Text style={[s.modalOptionText, form.gender === opt.value && s.modalOptionTextSelected]}>
                  {opt.label}
                </Text>
                {form.gender === opt.value && <CheckIcon />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  // Banda verde superior
  topBand: {
    backgroundColor: C.primary,
    paddingTop: 32,
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
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  logoAlcaldia:  { width: 130, height: 44 },
  logosDivider:  { width: 1, height: 36, backgroundColor: C.divider },
  logoUnipiloto: { width: 100, height: 44 },
  systemTitle: {
    fontSize: 18, fontWeight: '700',
    color: C.white, letterSpacing: 0.3, textAlign: 'center',
  },
  systemSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.72)',
    marginTop: 4, textAlign: 'center',
  },

  // Tarjeta
  card: {
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
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
  errorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.error, marginTop: 4 },
  generalErrorText: { flex: 1, color: C.error, fontSize: 13.5 },

  // Sección title
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.primaryMid,
    marginBottom: 12,
    marginTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.softGreen,
  },

  // Inputs
  row:          { flexDirection: 'row' },
  fieldWrapper: { marginBottom: 14 },
  label:        { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 7 },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.inputBg,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 15,
    color: C.text,
  },
  inputFocused:  { borderColor: C.borderFocus, backgroundColor: C.white },
  inputError:    { borderColor: C.error },
  errorText:     { fontSize: 12, color: C.error, marginTop: 4, marginLeft: 2 },

  // Picker género
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.inputBg,
    paddingHorizontal: 14,
    height: 50,
  },
  pickerText:        { fontSize: 15, color: C.text },
  pickerPlaceholder: { color: C.textLight },

  // Botón
  btn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: { color: C.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.4 },

  // Link login
  loginRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: C.textMid },
  loginLink: { fontSize: 14, color: C.primary, fontWeight: '700' },

  // Footer
  footer: {
    fontSize: 11.5,
    color: C.textLight,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },

  // Modal género
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: C.white,
    borderRadius: 20,
    width: '78%',
    paddingBottom: 12,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.divider,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '700', color: C.text,
    textAlign: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderColor: C.softGreen,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  modalOptionSelected:     { backgroundColor: C.softGreen },
  modalOptionText:         { fontSize: 15, color: C.text },
  modalOptionTextSelected: { color: C.primary, fontWeight: '600' },
});
