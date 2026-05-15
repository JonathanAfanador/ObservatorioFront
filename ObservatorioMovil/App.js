// App.js — Punto de entrada principal de la aplicación
import 'react-native-gesture-handler'; // Debe ser la primera importación
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

// Mantiene el splash nativo visible hasta que la app esté lista
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Oculta el splash nativo cuando la app JS está lista
    // (El RootNavigator muestra el SplashScreen JS mientras carga)
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor="#1B5E20" />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
