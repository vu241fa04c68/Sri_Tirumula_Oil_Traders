import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function VendorLayout() {
  const router = useRouter();
  const { role, user } = useAuth();

  useEffect(() => {
    // Security Guard: Prevent non-vendor users from accessing vendor routes
    if (role !== 'vendor') {
      router.replace('/(auth)/vendor-login');
    }
  }, [role]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="products" />
      <Stack.Screen name="product/add" />
      <Stack.Screen name="product/edit/[id]" />
      <Stack.Screen name="inventory" />
      <Stack.Screen name="customers" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
