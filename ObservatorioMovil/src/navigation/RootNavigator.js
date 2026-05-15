// RootNavigator — Maneja el flujo de navegación basado en el estado de autenticación
// Si hay token: muestra el Geovisor
// Si no hay token: muestra Login / Register
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import GeovisorScreen from '../screens/GeovisorScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

// Stack de autenticación (sin cabecera, pantallas full)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// Stack de la app principal (solo el Geovisor)
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Geovisor" component={GeovisorScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { loggedIn, loading } = useAuth();

  // Mientras verifica la sesión con el servidor, muestra el splash
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {loggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
