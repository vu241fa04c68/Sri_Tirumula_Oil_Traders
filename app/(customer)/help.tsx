import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Header } from '../../src/components/Header';
import { CallShopButton } from '../../src/components/CallShopButton';

export default function HelpFaqScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('helpFaq')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.question}>{t('faqQ1')}</Text>
          <Text style={styles.answer}>{t('faqA1')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.question}>{t('faqQ2')}</Text>
          <Text style={styles.answer}>{t('faqA2')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.question}>What payment methods are supported?</Text>
          <Text style={styles.answer}>We accept Cash on Delivery (COD) and Pay at Store upon pickup. UPI QR payment is supported directly at the shop counter.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.question}>Can I return or exchange an item?</Text>
          <Text style={styles.answer}>If any product or oil pouch is damaged during delivery, call shop owner immediately at 8008413774 for an instant replacement.</Text>
        </View>

        <View style={styles.callBox}>
          <Text style={styles.callBoxTitle}>Still have questions?</Text>
          <Text style={styles.callBoxSub}>Reach out to Sri Tirumala Oil Traders store owner</Text>
          <CallShopButton />
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
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  question: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  answer: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  callBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  callBoxTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  callBoxSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginVertical: 6,
    marginBottom: SPACING.md,
  },
});
