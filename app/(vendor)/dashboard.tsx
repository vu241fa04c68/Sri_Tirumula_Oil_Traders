import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { Header } from '../../src/components/Header';
import { orderService } from '../../src/services/orderService';
import { productService } from '../../src/services/productService';
import { Product, Order } from '../../src/types';

export default function VendorDashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { switchRole } = useAuth();

  const [metrics, setMetrics] = useState({
    todayCount: 0,
    allTodayCount: 0,
    pendingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    todaySales: 0,
    cancelledAmountToday: 0,
    cancelledCountToday: 0,
  });
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = async () => {
    const met = await orderService.getVendorMetrics();
    setMetrics(met);

    const allOrders = await orderService.getAllOrders();
    setPendingOrders(allOrders.filter(o => o.status === 'Pending'));

    const prods = await productService.getProducts(false);
    setLowStockProducts(prods.filter(p => p.stock <= 5));
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMetrics();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  const handleQuickAcceptOrder = async (orderId: string) => {
    await orderService.acceptOrder(orderId);
    await loadMetrics();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`${t('vendorDashboard')}`} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Welcome Shop Banner */}
        <View style={styles.shopBanner}>
          <View style={styles.shopIconCircle}>
            <Ionicons name="storefront" size={28} color={COLORS.surface} />
          </View>
          <View style={styles.shopBannerTextCol}>
            <Text style={styles.shopBannerName}>{SHOP_METADATA.nameEn}</Text>
            <Text style={styles.shopBannerSub}>Phone: {SHOP_METADATA.phone} • Owner Admin</Text>
          </View>

          <TouchableOpacity style={styles.exitBtn} onPress={() => { switchRole('customer'); router.replace('/(customer)/home'); }}>
            <Text style={styles.exitBtnText}>Exit Admin</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Sales Metric Banner */}
        <View style={styles.salesCard}>
          <Text style={styles.salesLabel}>{t('todaysSales')}</Text>
          <Text style={styles.salesValue}>₹{metrics.todaySales.toLocaleString()}</Text>
          <Text style={styles.salesSub}>Real-time sales (Cancelled & Rejected orders excluded)</Text>
          {metrics.cancelledAmountToday > 0 && (
            <View style={styles.cancelledExclusionNotice}>
              <Ionicons name="close-circle" size={13} color={COLORS.danger} style={{ marginRight: 4 }} />
              <Text style={styles.cancelledExclusionText}>
                ₹{metrics.cancelledAmountToday.toLocaleString()} from {metrics.cancelledCountToday} cancelled order(s) excluded
              </Text>
            </View>
          )}
        </View>

        {/* Orders Counter Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/(vendor)/orders')}
          >
            <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
            <Text style={styles.metricNum}>{metrics.todayCount}</Text>
            <Text style={styles.metricLabel}>{t('todaysOrders')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, styles.pendingBorder]}
            onPress={() => router.push('/(vendor)/orders')}
          >
            <Ionicons name="time-outline" size={24} color={COLORS.warning} />
            <Text style={[styles.metricNum, { color: COLORS.warning }]}>{metrics.pendingCount}</Text>
            <Text style={styles.metricLabel}>{t('pendingOrders')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/(vendor)/orders')}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={[styles.metricNum, { color: COLORS.success }]}>{metrics.completedCount}</Text>
            <Text style={styles.metricLabel}>{t('completedOrders')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/(vendor)/orders')}
          >
            <Ionicons name="close-circle-outline" size={24} color={COLORS.danger} />
            <Text style={[styles.metricNum, { color: COLORS.danger }]}>{metrics.cancelledCount}</Text>
            <Text style={styles.metricLabel}>{t('cancelledOrders')}</Text>
          </TouchableOpacity>
        </View>

        {/* --- INCOMING PENDING ORDERS ALERT & QUICK ACTIONS --- */}
        {pendingOrders.length > 0 && (
          <View style={styles.pendingSection}>
            <View style={styles.pendingSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="notifications" size={18} color={COLORS.warning} style={{ marginRight: 6 }} />
                <Text style={styles.pendingSectionTitle}>
                  Incoming Orders ({pendingOrders.length})
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(vendor)/orders')}>
                <Text style={styles.pendingViewAll}>View Full Queue →</Text>
              </TouchableOpacity>
            </View>

            {pendingOrders.slice(0, 3).map(order => (
              <View key={order.id} style={styles.pendingCard}>
                <View style={styles.pendingCardTop}>
                  <Text style={styles.pendingOrderId}>Order #{order.id}</Text>
                  <Text style={styles.pendingOrderTotal}>₹{order.total}</Text>
                </View>

                <Text style={styles.pendingCustName}>
                  👤 {order.customerName} • 📞 {order.customerPhone}
                </Text>
                <Text style={styles.pendingAddress} numberOfLines={1}>
                  📍 {order.address.fullAddress}
                </Text>

                <View style={styles.pendingCardActions}>
                  <TouchableOpacity
                    style={styles.pendingAcceptBtn}
                    onPress={() => handleQuickAcceptOrder(order.id)}
                  >
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.surface} style={{ marginRight: 4 }} />
                    <Text style={styles.pendingAcceptBtnText}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pendingRejectBtn}
                    onPress={() => router.push('/(vendor)/orders')}
                  >
                    <Ionicons name="close-circle" size={14} color={COLORS.surface} style={{ marginRight: 4 }} />
                    <Text style={styles.pendingRejectBtnText}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pendingFeeBtn}
                    onPress={() => router.push('/(vendor)/orders')}
                  >
                    <Ionicons name="bicycle" size={13} color={COLORS.primary} style={{ marginRight: 3 }} />
                    <Text style={styles.pendingFeeBtnText}>Fee: ₹{order.deliveryCharge}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Management Tools */}
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(vendor)/orders')}
          >
            <Ionicons name="list" size={22} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Order Queue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(vendor)/settings')}
          >
            <Ionicons name="bicycle" size={22} color={COLORS.accentWarm} />
            <Text style={styles.actionBtnText}>Delivery Fees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(vendor)/products')}
          >
            <Ionicons name="cube" size={22} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>Product Catalog</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(vendor)/product/add')}
          >
            <Ionicons name="add-circle" size={22} color={COLORS.success} />
            <Text style={styles.actionBtnText}>{t('addProduct')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(vendor)/inventory')}
          >
            <Ionicons name="stats-chart" size={22} color={COLORS.accentWarm} />
            <Text style={styles.actionBtnText}>{t('inventoryStock')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(vendor)/settings')}
          >
            <Ionicons name="settings" size={22} color={COLORS.textMuted} />
            <Text style={styles.actionBtnText}>Shop Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Low Stock Warning Alert Section */}
        {lowStockProducts.length > 0 && (
          <View style={styles.lowStockSection}>
            <View style={styles.lowStockHeader}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
              <Text style={styles.lowStockTitle}>
                {t('lowStockItems')} ({lowStockProducts.length})
              </Text>
            </View>

            {lowStockProducts.map(p => (
              <View key={p.id} style={styles.lowStockRow}>
                <Text style={styles.lowStockName} numberOfLines={1}>{p.nameEn}</Text>
                <Text style={styles.lowStockCount}>Stock: {p.stock} left</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.updateStockBtn}
              onPress={() => router.push('/(vendor)/inventory')}
            >
              <Text style={styles.updateStockBtnText}>Update Inventory Stock Now</Text>
            </TouchableOpacity>
          </View>
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
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  shopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  shopIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopBannerTextCol: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  shopBannerName: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopBannerSub: {
    color: COLORS.accent,
    fontSize: 11,
    marginTop: 2,
  },
  exitBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  exitBtnText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  salesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 2,
  },
  salesLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  salesValue: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginVertical: 4,
  },
  salesSub: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  cancelledExclusionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  cancelledExclusionText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  pendingBorder: {
    borderColor: COLORS.warning,
    backgroundColor: '#FFFDE7',
  },
  metricNum: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // Pending Incoming Orders Section
  pendingSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: SPACING.md,
  },
  pendingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pendingSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  pendingViewAll: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pendingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  pendingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingOrderId: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  pendingOrderTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  pendingCustName: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 2,
  },
  pendingAddress: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pendingCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.xs,
  },
  pendingAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pendingAcceptBtnText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
  pendingRejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pendingRejectBtnText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
  pendingFeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  pendingFeeBtnText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  lowStockSection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning,
    marginBottom: SPACING.md,
  },
  lowStockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  lowStockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: 6,
  },
  lowStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  lowStockName: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  lowStockCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  updateStockBtn: {
    backgroundColor: COLORS.warning,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  updateStockBtnText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
