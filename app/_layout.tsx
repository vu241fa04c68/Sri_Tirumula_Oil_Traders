import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../src/context/LanguageContext';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'sri-tirumala-responsive-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          html, body {
            margin: 0;
            padding: 0;
            background-color: #EDE8E1;
            overflow-x: hidden;
          }
          #root {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background-color: #EDE8E1;
          }
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(122, 28, 28, 0.3);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(122, 28, 28, 0.6);
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="light" backgroundColor={COLORS.primaryDark} />
          <View style={[styles.outerWrapper, isWebDesktop && styles.desktopOuterWrapper]}>
            <View style={[styles.appShell, isWebDesktop && styles.desktopAppShell]}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: COLORS.background },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)/login" />
                <Stack.Screen name="(auth)/vendor-login" />
                <Stack.Screen name="(customer)" />
                <Stack.Screen name="(vendor)" />
              </Stack>
            </View>
          </View>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  desktopOuterWrapper: {
    backgroundColor: '#EDE8E1',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: '100%',
  },
  appShell: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  desktopAppShell: {
    maxWidth: 768,
    backgroundColor: COLORS.background,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2DDD4',
  },
});

