import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function CustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="search" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="tracking/[id]" />
      <Stack.Screen name="orders/index" />
      <Stack.Screen name="orders/[id]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
