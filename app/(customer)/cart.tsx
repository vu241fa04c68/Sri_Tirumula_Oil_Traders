import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { useCart } from '../../src/context/CartContext';
import { Header } from '../../src/components/Header';

export default function CartScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { items, updateQuantity, removeFromCart, subtotal, deliveryCharge, grandTotal, deliveryConfig } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title={t('myCart')} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={72} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>{t('emptyCart')}</Text>
          <Text style={styles.emptySub}>{t('emptyCartSub')}</Text>

          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(customer)/home')}>
            <Text style={styles.shopBtnText}>{t('startShopping')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('myCart')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cart Items List */}
        {items.map(item => {
          const title = language === 'te' ? item.product.nameTe : item.product.nameEn;
          const activePrice = item.product.discountPrice || item.product.price;

          return (
            <View key={item.product.id} style={styles.itemRow}>
              <Image source={{ uri: item.product.image }} style={styles.itemImage} resizeMode="cover" />

              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {title}
                </Text>
                <Text style={styles.itemUnit}>{item.product.unit}</Text>
                <Text style={styles.itemPrice}>₹{activePrice}</Text>
              </View>

              <View style={styles.actionCol}>
                <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>

                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color={COLORS.text} />
                  </TouchableOpacity>

                  <Text style={styles.qtyNum}>{item.quantity}</Text>

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Bill Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeaderTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('subtotal')}</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('deliveryCharge')}</Text>
            <Text style={styles.summaryValue}>
              {deliveryCharge === 0 ? t('freeDelivery') : `₹${deliveryCharge}`}
            </Text>
          </View>

          {deliveryCharge > 0 && deliveryConfig.freeDeliveryThreshold > 0 && subtotal < deliveryConfig.freeDeliveryThreshold && (
            <Text style={styles.freeThresholdText}>
              Add ₹{deliveryConfig.freeDeliveryThreshold - subtotal} more for FREE Delivery
            </Text>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('grandTotal')}</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.barLabel}>{t('grandTotal')}</Text>
          <Text style={styles.barPrice}>₹{grandTotal}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/(customer)/checkout')}>
          <Text style={styles.checkoutBtnText}>{t('proceedToCheckout')}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.surface} style={{ marginLeft: 6 }} />
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 95,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.xl,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  shopBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  itemImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
    backgroundColor: COLORS.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 4,
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 65,
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyNum: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.md,
  },
  summaryHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  freeThresholdText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
    marginVertical: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 10,
    maxWidth: 768,
    alignSelf: 'center',
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  barPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  checkoutBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
