import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHOP_METADATA, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

interface CallShopButtonProps {
  variant?: 'full' | 'compact' | 'floating';
}

export const CallShopButton: React.FC<CallShopButtonProps> = ({ variant = 'full' }) => {
  const { t } = useLanguage();

  const handleCall = () => {
    const phoneNumber = `tel:${SHOP_METADATA.phone}`;
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          Alert.alert(t('error'), `Phone dialing is not supported on this device. Call manually: ${SHOP_METADATA.phone}`);
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(err => console.error('An error occurred opening phone dialer', err));
  };

  if (variant === 'floating') {
    return (
      <TouchableOpacity style={styles.floatingBtn} onPress={handleCall} activeOpacity={0.85}>
        <Ionicons name="call" size={24} color={COLORS.surface} />
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactBtn} onPress={handleCall} activeOpacity={0.85}>
        <Ionicons name="call" size={16} color={COLORS.surface} style={{ marginRight: 4 }} />
        <Text style={styles.compactBtnText}>{t('callShopNow')}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.fullBtn} onPress={handleCall} activeOpacity={0.85}>
      <Ionicons name="call-sharp" size={20} color={COLORS.surface} style={{ marginRight: 8 }} />
      <Text style={styles.fullBtnText}>{t('callShopNow')}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullBtn: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fullBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
  compactBtn: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  compactBtnText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.success,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 99,
  },
});
