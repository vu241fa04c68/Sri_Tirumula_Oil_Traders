import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { Header } from '../../src/components/Header';
import { orderService } from '../../src/services/orderService';
import { Address } from '../../src/types';
import { sendOrderToWhatsApp } from '../../src/utils/whatsappHelper';

export default function CheckoutScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { items, subtotal, deliveryCharge, grandTotal, clearCart } = useCart();
  const { user, updateUserAddresses } = useAuth();

  const isCustomerUser = !!user && user.role === 'customer';

  // Customer info fields start empty to show clear user placeholders
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PICKUP' | 'ONLINE'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !fullAddress.trim()) {
      Alert.alert(t('error'), 'Please fill in your Customer Name, Phone Number, and Delivery Address.');
      return;
    }

    setIsSubmitting(true);

    const addressObj: Address = {
      id: 'addr_' + Date.now(),
      title: 'Home',
      fullAddress,
      landmark,
      city: city || 'Local Town',
      pincode: pincode || '530001',
    };

    // Save address to customer user profile if logged in as customer
    if (isCustomerUser) {
      await updateUserAddresses(addressObj);
    }

    // Map cart items to order items
    const orderItems = items.map(item => ({
      productId: item.product.id,
      nameEn: item.product.nameEn,
      nameTe: item.product.nameTe,
      price: item.product.discountPrice || item.product.price,
      quantity: item.quantity,
      unit: item.product.unit,
      image: item.product.image,
    }));

    const finalDeliveryCharge = paymentMethod === 'PICKUP' ? 0 : deliveryCharge;
    const finalTotal = subtotal + finalDeliveryCharge;

    const newOrder = await orderService.createOrder(
      (isCustomerUser && user) ? user.uid : 'cust_' + Date.now(),
      customerName.trim(),
      customerPhone.trim(),
      orderItems,
      subtotal,
      finalDeliveryCharge,
      finalTotal,
      addressObj,
      paymentMethod
    );

    // Send order items and total amount to Admin WhatsApp (8008413774)
    sendOrderToWhatsApp(newOrder);

    clearCart();
    setIsSubmitting(false);

    if (Platform.OS === 'web') {
      alert(`🎉 Order Placed Successfully!\n\nOrder #${newOrder.id.slice(-6).toUpperCase()}\nOrder items & total amount (₹${finalTotal}) have been sent to Admin WhatsApp (8008413774)!`);
      router.replace(`/(customer)/tracking/${newOrder.id}`);
    } else {
      Alert.alert(
        '🎉 Order Placed Successfully!',
        `Order items & total amount (₹${finalTotal}) have been sent to Admin WhatsApp (8008413774)!`,
        [
          {
            text: t('trackOrder'),
            onPress: () => router.replace(`/(customer)/tracking/${newOrder.id}`),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('checkout')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Customer Contact Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. Customer Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('enterName')} *</Text>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter Customer Full Name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('enterPhone')} *</Text>
            <TextInput
              style={styles.input}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              placeholder="Enter Customer 10-Digit Mobile Number"
            />
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. {t('deliveryAddress')}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('streetAddress')} *</Text>
            <TextInput
              style={styles.input}
              value={fullAddress}
              onChangeText={setFullAddress}
              placeholder="Enter House / Door No, Street Name, Village"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>{t('city')}</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Enter City / Village Name" />
            </View>

            <View style={[styles.inputGroup, { width: 110 }]}>
              <Text style={styles.label}>{t('pincode')}</Text>
              <TextInput style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="number-pad" placeholder="530001" />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>3. {t('paymentMethod')}</Text>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.activePaymentOption]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons
              name={paymentMethod === 'COD' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={COLORS.primary}
            />
            <View style={styles.paymentOptionTextCol}>
              <Text style={styles.paymentOptionTitle}>{t('cod')}</Text>
              <Text style={styles.paymentOptionSub}>Pay cash to delivery person upon arrival</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'PICKUP' && styles.activePaymentOption]}
            onPress={() => setPaymentMethod('PICKUP')}
          >
            <Ionicons
              name={paymentMethod === 'PICKUP' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={COLORS.primary}
            />
            <View style={styles.paymentOptionTextCol}>
              <Text style={styles.paymentOptionTitle}>{t('pickup')}</Text>
              <Text style={styles.paymentOptionSub}>Pick up directly at shop (Zero delivery fee)</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.paymentOption, styles.disabledPaymentOption]}>
            <Ionicons name="card-outline" size={20} color={COLORS.textMuted} />
            <View style={styles.paymentOptionTextCol}>
              <Text style={[styles.paymentOptionTitle, { color: COLORS.textMuted }]}>{t('onlinePay')}</Text>
              <Text style={styles.paymentOptionSub}>UPI/QR payment integration available soon</Text>
            </View>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>4. Order Items ({items.length})</Text>
          {items.map(item => (
            <View key={item.product.id} style={styles.itemSummaryRow}>
              <Text style={styles.itemSummaryName} numberOfLines={1}>
                {item.product.nameEn} x {item.quantity}
              </Text>
              <Text style={styles.itemSummaryPrice}>
                ₹{(item.product.discountPrice || item.product.price) * item.quantity}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Place Order Bar */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.footerLabel}>{t('grandTotal')}</Text>
          <Text style={styles.footerPrice}>
            ₹{subtotal + (paymentMethod === 'PICKUP' ? 0 : deliveryCharge)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isSubmitting && styles.disabledBtn]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          <Text style={styles.placeOrderBtnText}>
            {isSubmitting ? t('orderPlacing') : t('placeOrder')}
          </Text>
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
    paddingBottom: 90,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
  },
  label: {
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
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.sm,
  },
  activePaymentOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5',
  },
  disabledPaymentOption: {
    opacity: 0.6,
  },
  paymentOptionTextCol: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  paymentOptionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemSummaryName: {
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
    marginRight: 8,
  },
  itemSummaryPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  footerBar: {
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
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  placeOrderBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  placeOrderBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: COLORS.textMuted,
  },
});
