import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../src/constants/theme';
import { useLanguage } from '../../../src/context/LanguageContext';
import { Header } from '../../../src/components/Header';
import { OrderStatusTimeline } from '../../../src/components/OrderStatusTimeline';
import { CallShopButton } from '../../../src/components/CallShopButton';
import { orderService } from '../../../src/services/orderService';
import { Order, OrderItem } from '../../../src/types';

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language, t } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrder = async () => {
    if (id) {
      const ord = await orderService.getOrderById(id);
      setOrder(ord);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll status updates every 4 seconds for live tracking sync
    const interval = setInterval(fetchOrder, 4000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack title={t('trackOrder')} />
        <View style={styles.loadingContainer}>
          <Text>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={`${t('trackOrder')} #${order.id}`} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Header Summary */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.orderIdText}>Order #{order.id}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>

          <Text style={styles.dateText}>
            Placed on: {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Visual Timeline Component */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Live Delivery Timeline</Text>
          <OrderStatusTimeline currentStatus={order.status} />
        </View>

        {/* Delivery Address & Contact */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('deliveryAddress')}</Text>
          <Text style={styles.customerName}>{order.customerName} ({order.customerPhone})</Text>
          <Text style={styles.addressText}>{order.address.fullAddress}</Text>
          <Text style={styles.addressSub}>{order.address.city} - {order.address.pincode}</Text>
        </View>

        {/* Items Ordered */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('items')} ({order.items.length})</Text>

          {order.items.map((item: OrderItem, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {language === 'te' ? item.nameTe : item.nameEn}
                </Text>
                <Text style={styles.itemMeta}>Qty: {item.quantity} • {item.unit}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.totalBreakdown}>
            <View style={styles.breakRow}>
              <Text style={styles.breakLabel}>{t('subtotal')}</Text>
              <Text style={styles.breakVal}>₹{order.subtotal}</Text>
            </View>
            <View style={styles.breakRow}>
              <Text style={styles.breakLabel}>{t('deliveryCharge')}</Text>
              <Text style={styles.breakVal}>₹{order.deliveryCharge}</Text>
            </View>
            <View style={[styles.breakRow, styles.grandRow]}>
              <Text style={styles.grandLabel}>{t('grandTotal')}</Text>
              <Text style={styles.grandVal}>₹{order.total}</Text>
            </View>
          </View>
        </View>

        {/* Need Help Action */}
        <View style={styles.helpBox}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.helpTitle}>Questions about your delivery?</Text>
          <Text style={styles.helpSub}>Call Sri Tirumala Oil Traders store directly</Text>
          <CallShopButton variant="compact" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statusBadge: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  addressSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: COLORS.borderLight,
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  breakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  breakVal: {
    fontSize: 12,
    color: COLORS.text,
  },
  grandRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
    marginTop: 4,
  },
  grandLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  grandVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
  },
  helpBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  helpSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
});
