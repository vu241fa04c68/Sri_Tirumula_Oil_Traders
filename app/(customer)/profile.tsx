import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { Header } from '../../src/components/Header';
import { CallShopButton } from '../../src/components/CallShopButton';
import { Address } from '../../src/types';

export default function StoreInfoAndSettingsScreen() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { savedCustomerInfo, updateSavedCustomerInfo, updateUserAddresses } = useAuth();

  // Add/Edit Delivery Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Home');
  const [custName, setCustName] = useState(savedCustomerInfo.name || '');
  const [custPhone, setCustPhone] = useState(savedCustomerInfo.phone || '');
  const [fullAddrInput, setFullAddrInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [pincodeInput, setPincodeInput] = useState('');

  const handleSaveNewAddress = async () => {
    if (!fullAddrInput.trim()) {
      Alert.alert(t('error'), 'Please enter your street address.');
      return;
    }

    const newAddr: Address = {
      id: 'addr_' + Date.now(),
      title: addrTitle.trim() || 'Home',
      fullAddress: fullAddrInput.trim(),
      city: cityInput.trim() || 'Local Town',
      pincode: pincodeInput.trim() || '530001',
    };

    if (custName.trim() || custPhone.trim()) {
      await updateSavedCustomerInfo({
        name: custName.trim(),
        phone: custPhone.trim(),
      });
    }

    await updateUserAddresses(newAddr);
    setShowAddressModal(false);
    setFullAddrInput('');
    setCityInput('');
    setPincodeInput('');
    Alert.alert(t('success'), 'Delivery details saved for fast checkout!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={language === 'te' ? 'స్టోర్ సమాచారం' : 'Store Information'} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Store Brand Hero Card */}
        <View style={styles.storeCard}>
          <View style={styles.storeIconCircle}>
            <Ionicons name="storefront" size={38} color={COLORS.accent} />
          </View>

          <Text style={styles.storeName}>
            {language === 'te' ? SHOP_METADATA.nameTe : SHOP_METADATA.nameEn}
          </Text>
          <Text style={styles.storeTagline}>{t('shopTagline')}</Text>

          <View style={styles.phoneChip}>
            <Ionicons name="call" size={14} color={COLORS.surface} style={{ marginRight: 6 }} />
            <Text style={styles.phoneChipText}>{SHOP_METADATA.phone}</Text>
          </View>

          <View style={{ marginTop: SPACING.md, width: '100%' }}>
            <CallShopButton />
          </View>
        </View>

        {/* Store Location & Timings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Store Location & Hours</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>
                {language === 'te' ? SHOP_METADATA.addressTe : SHOP_METADATA.addressEn}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginTop: SPACING.md }]}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Business Hours</Text>
              <Text style={styles.infoValue}>
                {language === 'te' ? SHOP_METADATA.businessHoursTe : SHOP_METADATA.businessHoursEn}
              </Text>
            </View>
          </View>
        </View>

        {/* Language Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 {t('language')}</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setLanguage(language === 'en' ? 'te' : 'en')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="language-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>{t('selectLanguage')}</Text>
            </View>
            <Text style={styles.langValue}>{language === 'en' ? 'English' : 'తెలుగు'}</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Delivery Details (Optional for Checkout Speed) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>🏠 Saved Delivery Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(true)}>
              <Text style={styles.linkText}>+ Add / Edit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardSubtitle}>
            Saved on your device to pre-fill checkout automatically.
          </Text>

          {savedCustomerInfo.addresses && savedCustomerInfo.addresses.length > 0 ? (
            savedCustomerInfo.addresses.map((addr, idx) => (
              <View key={idx} style={styles.addressBox}>
                <Ionicons name="location" size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
                <View style={styles.addressCol}>
                  <Text style={styles.addrTitle}>{addr.title}</Text>
                  <Text style={styles.addrSub}>{addr.fullAddress}</Text>
                  <Text style={styles.addrCity}>{addr.city} - {addr.pincode}</Text>
                </View>
              </View>
            ))
          ) : (
            <TouchableOpacity style={styles.emptyAddrBox} onPress={() => setShowAddressModal(true)}>
              <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
              <Text style={styles.addFirstAddrText}>Save Your Delivery Address for Fast Orders</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Help & FAQ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 Support & Help</Text>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(customer)/help')}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>{t('helpFaq')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Vendor Portal (Shop Owner Login ONLY) */}
        <View style={[styles.card, styles.vendorCard]}>
          <View style={styles.vendorHeaderRow}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.accentWarm} />
            <Text style={styles.vendorCardTitle}>Shop Owner / Admin Portal</Text>
          </View>
          <Text style={styles.vendorCardSub}>
            Only authorized store management can log in to view orders, edit prices, update inventory and delivery fees.
          </Text>

          <TouchableOpacity
            style={styles.vendorLoginBtn}
            onPress={() => router.push('/(auth)/vendor-login')}
          >
            <Ionicons name="lock-closed" size={16} color={COLORS.surface} style={{ marginRight: 6 }} />
            <Text style={styles.vendorLoginBtnText}>Shop Owner Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 Save Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={custName}
                onChangeText={setCustName}
                placeholder="Enter Full Name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={custPhone}
                onChangeText={setCustPhone}
                keyboardType="phone-pad"
                placeholder="Enter 10-Digit Mobile Number"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Label</Text>
              <TextInput
                style={styles.input}
                value={addrTitle}
                onChangeText={setAddrTitle}
                placeholder="Home / Work / Shop"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={fullAddrInput}
                onChangeText={setFullAddrInput}
                placeholder="House No, Street Name, Village / Area"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>City / Village</Text>
                <TextInput
                  style={styles.input}
                  value={cityInput}
                  onChangeText={setCityInput}
                  placeholder="Local Town"
                />
              </View>

              <View style={[styles.inputGroup, { width: 110 }]}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  value={pincodeInput}
                  onChangeText={setPincodeInput}
                  keyboardType="number-pad"
                  placeholder="530001"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNewAddress}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  storeCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  storeIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.surface,
    textAlign: 'center',
  },
  storeTagline: {
    fontSize: 12,
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: 4,
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginTop: SPACING.sm,
  },
  phoneChipText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  linkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoCol: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  langValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  addressCol: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  addrTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  addrSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  addrCity: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyAddrBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#FFF9F9',
  },
  addFirstAddrText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
  },
  vendorCard: {
    backgroundColor: '#FFFDF0',
    borderColor: COLORS.accentWarm,
  },
  vendorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginLeft: 6,
  },
  vendorCardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginVertical: SPACING.xs,
    lineHeight: 16,
  },
  vendorLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: SPACING.sm,
  },
  vendorLoginBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    elevation: 10,
    width: '100%',
    maxWidth: 480,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
