import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, SHOP_METADATA } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { itemCount } = useCart();
  const { role, switchRole } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.surface} />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandIconContainer}>
              <Ionicons name="storefront" size={22} color={COLORS.accent} />
            </View>
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {title || (language === 'te' ? SHOP_METADATA.nameTe : SHOP_METADATA.nameEn)}
            </Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {t('shopTagline')}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {/* Language Switch Button */}
          <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
            <Text style={styles.langBtnText}>{language === 'en' ? 'తెలుగు' : 'English'}</Text>
          </TouchableOpacity>

          {/* Admin / Shop Owner Login Toggle (Vendor Only) */}
          <TouchableOpacity
            style={[styles.roleBadge, role === 'vendor' && styles.vendorRoleBadge]}
            onPress={() => {
              if (role === 'customer') {
                router.push('/(auth)/vendor-login');
              } else {
                switchRole('customer');
                router.replace('/(customer)/home');
              }
            }}
          >
            <Ionicons
              name={role === 'vendor' ? 'storefront-outline' : 'shield-outline'}
              size={15}
              color={COLORS.surface}
            />
            <Text style={styles.roleText}>{role === 'vendor' ? 'Exit Admin' : 'Admin'}</Text>
          </TouchableOpacity>

          {/* Cart Icon */}
          {role === 'customer' && (
            <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/(customer)/cart')}>
              <Ionicons name="cart-outline" size={24} color={COLORS.surface} />
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: 45,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  iconBtn: {
    padding: SPACING.xs,
    marginRight: SPACING.xs,
  },
  titleContainer: {
    flex: 1,
  },
  brandTitle: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  langBtnText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
  },
  vendorRoleBadge: {
    backgroundColor: '#FF9800',
  },
  roleText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  cartBtn: {
    position: 'relative',
    padding: SPACING.xs,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.accentWarm,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
