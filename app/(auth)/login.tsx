import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../../src/constants/theme';
import { Header } from '../../src/components/Header';

export default function CustomerLoginScreen() {
  const router = useRouter();

  useEffect(() => {
    // Only the vendor has login; customer app has no login requirement
    router.replace('/(customer)/home');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={SHOP_METADATA.nameEn} />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="cart" size={54} color={COLORS.primary} />
        </View>

        <Text style={styles.heading}>Welcome to Sri Tirumala Oil Traders</Text>
        <Text style={styles.subheading}>
          No login or registration needed to shop! Browse pure cooking oils and kirana essentials, and place your order directly.
        </Text>

        <TouchableOpacity style={styles.submitBtn} onPress={() => router.replace('/(customer)/home')}>
          <Text style={styles.submitBtnText}>Start Shopping Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.vendorLink} onPress={() => router.push('/(auth)/vendor-login')}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.vendorLinkText}>Are you the Shop Owner? Vendor Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: SPACING.xl,
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  vendorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    padding: SPACING.sm,
  },
  vendorLinkText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
