import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../src/context/LanguageContext';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="light" backgroundColor={COLORS.primaryDark} />
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
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
