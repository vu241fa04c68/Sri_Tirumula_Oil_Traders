import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../src/constants/theme';
import { useLanguage } from '../src/context/LanguageContext';
import { useAuth } from '../src/context/AuthContext';

export default function EntryScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { switchRole } = useAuth();

  const handleStartCustomer = () => {
    switchRole('customer');
    router.replace('/(customer)/home');
  };

  const handleStartVendor = () => {
    router.push('/(auth)/vendor-login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Banner Header */}
        <View style={styles.brandHero}>
          <View style={styles.logoBadge}>
            <Ionicons name="storefront" size={54} color={COLORS.accent} />
          </View>
          <Text style={styles.shopTitle}>
            {language === 'te' ? SHOP_METADATA.nameTe : SHOP_METADATA.nameEn}
          </Text>
          <Text style={styles.shopSubtext}>{t('shopTagline')}</Text>

          <View style={styles.contactChip}>
            <Ionicons name="call" size={14} color={COLORS.surface} style={{ marginRight: 6 }} />
            <Text style={styles.contactChipText}>{SHOP_METADATA.phone}</Text>
          </View>
        </View>

        {/* Language Selection Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('selectLanguage')}</Text>
          <Text style={styles.cardSubtitle}>Choose your preferred language / అనుకూలమైన భాషను ఎంచుకోండి</Text>

          <View style={styles.langToggleRow}>
            <TouchableOpacity
              style={[styles.langChoice, language === 'en' && styles.activeLangChoice]}
              onPress={() => setLanguage('en')}
            >
              <Ionicons
                name={language === 'en' ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={language === 'en' ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.langChoiceText, language === 'en' && styles.activeLangText]}>
                {t('english')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langChoice, language === 'te' && styles.activeLangChoice]}
              onPress={() => setLanguage('te')}
            >
              <Ionicons
                name={language === 'te' ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={language === 'te' ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={[styles.langChoiceText, language === 'te' && styles.activeLangText]}>
                {t('telugu')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Entry Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStartCustomer} activeOpacity={0.88}>
            <Ionicons name="cart" size={22} color={COLORS.surface} style={{ marginRight: 10 }} />
            <Text style={styles.primaryBtnText}>{t('startShopping')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleStartVendor} activeOpacity={0.85}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>{t('vendorPortal')}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Guarantee */}
        <View style={styles.footerInfo}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.success} />
          <Text style={styles.footerInfoText}>
            100% Pure & Authentic Local Kirana • Fast Home Delivery
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandHero: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  logoBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    marginBottom: SPACING.md,
  },
  shopTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  shopSubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.md,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: SPACING.sm,
  },
  contactChipText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  langToggleRow: {
    gap: SPACING.sm,
  },
  langChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  activeLangChoice: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5',
  },
  langChoiceText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
  activeLangText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  actionContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryBtnText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  footerInfoText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 6,
    fontWeight: '500',
  },
});
