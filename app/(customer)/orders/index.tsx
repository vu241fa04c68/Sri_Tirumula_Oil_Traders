import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../src/constants/theme';
import { useLanguage } from '../../../src/context/LanguageContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Header } from '../../../src/components/Header';
import { orderService } from '../../../src/services/orderService';
import { Order } from '../../../src/types';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadOrders = async () => {
    const data = await orderService.getCustomerOrders(user?.uid || 'guest');
    setOrders(data);
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('myOrders')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>{t('noOrders')}</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(customer)/home')}>
              <Text style={styles.shopBtnText}>{t('startShopping')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map(order => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/(customer)/tracking/${order.id}`)}
              activeOpacity={0.88}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.itemsSummary}>
                <Text style={styles.itemsText} numberOfLines={1}>
                  {order.items.map(i => i.nameEn).join(', ')}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.totalText}>Total: ₹{order.total}</Text>
                <View style={styles.trackLink}>
                  <Text style={styles.trackLinkText}>{t('trackOrder')}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginVertical: SPACING.md,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  shopBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  orderDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemsSummary: {
    marginVertical: SPACING.sm,
  },
  itemsText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  totalText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  trackLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
