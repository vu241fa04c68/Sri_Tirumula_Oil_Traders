import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Header } from '../../src/components/Header';
import { orderService } from '../../src/services/orderService';
import { Order, OrderStatus } from '../../src/types';

export default function VendorOrdersScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [refreshing, setRefreshing] = useState(false);

  // Delivery Fee Edit Modal State
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [newFeeInput, setNewFeeInput] = useState('0');
  const [isUpdatingFee, setIsUpdatingFee] = useState(false);

  // Reject Order Modal State
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [orderToReject, setOrderToReject] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Out of stock / Unavailable');
  const [isRejecting, setIsRejecting] = useState(false);

  // Success / Notice message banner
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showCrossPlatformAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const loadOrders = async () => {
    const all = await orderService.getAllOrders();
    setOrders([...all]);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  // --- ACCEPT ORDER ACTION ---
  const handleAcceptOrder = async (order: Order) => {
    const updated = await orderService.acceptOrder(order.id);
    if (updated) {
      const msg = `✅ Order #${order.id} Accepted! Customer notified.`;
      setStatusNotice(msg);
      showCrossPlatformAlert('Order Accepted', msg);
      await loadOrders();
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  // --- REJECT ORDER MODAL TRIGGER ---
  const handleOpenRejectModal = (order: Order) => {
    setOrderToReject(order);
    setRejectReason('Items temporarily unavailable in stock');
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!orderToReject) return;
    setIsRejecting(true);
    const updated = await orderService.rejectOrder(orderToReject.id);
    setIsRejecting(false);
    setRejectModalVisible(false);

    if (updated) {
      const msg = `❌ Order #${orderToReject.id} has been Rejected. Item quantities returned to stock.`;
      setStatusNotice(msg);
      showCrossPlatformAlert('Order Rejected', msg);
      await loadOrders();
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  // --- CHANGE DELIVERY FEE MODAL TRIGGER ---
  const handleOpenFeeModal = (order: Order) => {
    setTargetOrder(order);
    setNewFeeInput(order.deliveryCharge.toString());
    setFeeModalVisible(true);
  };

  const handleSaveDeliveryFee = async () => {
    if (!targetOrder) return;
    const feeNum = parseFloat(newFeeInput) || 0;
    if (feeNum < 0) {
      showCrossPlatformAlert('Invalid Fee', 'Delivery charge cannot be negative.');
      return;
    }

    setIsUpdatingFee(true);
    const updated = await orderService.updateOrderDeliveryCharge(targetOrder.id, feeNum);
    setIsUpdatingFee(false);
    setFeeModalVisible(false);

    if (updated) {
      const msg = `🚚 Order #${targetOrder.id} delivery fee updated to ₹${feeNum}! New Total: ₹${updated.total}`;
      setStatusNotice(msg);
      showCrossPlatformAlert('Delivery Fee Updated', msg);
      await loadOrders();
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  // --- PROGRESSIVE STATUS UPDATE ---
  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const updated = await orderService.updateOrderStatus(orderId, nextStatus);
    if (updated) {
      const msg = `Order #${orderId} status updated to: ${nextStatus}`;
      setStatusNotice(msg);
      await loadOrders();
      setTimeout(() => setStatusNotice(null), 3500);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'PENDING') return o.status === 'Pending';
    if (filter === 'ACTIVE') return o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready' || o.status === 'Out for Delivery';
    if (filter === 'COMPLETED') return o.status === 'Delivered';
    if (filter === 'CANCELLED') return o.status === 'Cancelled' || o.status === 'Rejected';
    return true;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return COLORS.warning;
      case 'Accepted': return COLORS.info;
      case 'Preparing': return '#8E24AA';
      case 'Ready': return '#00897B';
      case 'Out for Delivery': return COLORS.accentWarm;
      case 'Delivered': return COLORS.success;
      case 'Cancelled':
      case 'Rejected': return COLORS.danger;
      default: return COLORS.textMuted;
    }
  };

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const activeCount = orders.filter(o => o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready' || o.status === 'Out for Delivery').length;

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Vendor Orders Management" />

      {/* Global Delivery Settings Shortcut Banner */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topBarTitle}>Shop Order Queue</Text>
          <Text style={styles.topBarSub}>Manage incoming customer orders & delivery charges</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsLinkBtn}
          onPress={() => router.push('/(vendor)/settings')}
        >
          <Ionicons name="settings-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.settingsLinkText}>Default Delivery Fees</Text>
        </TouchableOpacity>
      </View>

      {/* Live Status Toast Banner */}
      {statusNotice && (
        <View style={styles.toastBanner}>
          <Ionicons name="information-circle" size={18} color={COLORS.surface} style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{statusNotice}</Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'PENDING' && styles.activeFilterTab]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.filterTabText, filter === 'PENDING' && styles.activeFilterTabText]}>
            Pending ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'ACTIVE' && styles.activeFilterTab]}
          onPress={() => setFilter('ACTIVE')}
        >
          <Text style={[styles.filterTabText, filter === 'ACTIVE' && styles.activeFilterTabText]}>
            Active ({activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'ALL' && styles.activeFilterTab]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterTabText, filter === 'ALL' && styles.activeFilterTabText]}>
            All ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'COMPLETED' && styles.activeFilterTab]}
          onPress={() => setFilter('COMPLETED')}
        >
          <Text style={[styles.filterTabText, filter === 'COMPLETED' && styles.activeFilterTabText]}>
            Delivered
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'CANCELLED' && styles.activeFilterTab]}
          onPress={() => setFilter('CANCELLED')}
        >
          <Text style={[styles.filterTabText, filter === 'CANCELLED' && styles.activeFilterTabText]}>
            Rejected
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={54} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No orders in this category</Text>
            <Text style={styles.emptySub}>When a customer places an order, it will appear here immediately.</Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.idRow}>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
                    <View style={[styles.statusChip, { backgroundColor: `${getStatusColor(order.status)}18` }]}>
                      <Text style={[styles.statusChipText, { color: getStatusColor(order.status) }]}>
                        {order.status === 'Rejected' ? 'Rejected' : order.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.custInfo}>
                    👤 {order.customerName} • 📞 {order.customerPhone}
                  </Text>
                  <Text style={styles.timeText}>
                    🕒 Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              </View>

              {/* Delivery Address */}
              <View style={styles.addressBox}>
                <Text style={styles.addressText}>
                  📍 <Text style={{ fontWeight: '600' }}>Address:</Text> {order.address.fullAddress}, {order.address.city} - {order.address.pincode}
                </Text>
              </View>

              {/* Items Summary */}
              <View style={styles.itemsSummary}>
                <Text style={styles.itemsSummaryTitle}>Order Items ({order.items.length}):</Text>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemLine}>
                      • {item.nameEn} x {item.quantity} ({item.unit})
                    </Text>
                    <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                  </View>
                ))}
              </View>

              {/* Financial Breakdown & Delivery Fee Edit Action */}
              <View style={styles.financialBox}>
                <View style={styles.financeRow}>
                  <Text style={styles.financeLabel}>Items Subtotal:</Text>
                  <Text style={styles.financeValue}>₹{order.subtotal}</Text>
                </View>

                <View style={styles.financeRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.financeLabel}>Delivery Fee:</Text>
                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Rejected' && (
                      <TouchableOpacity
                        style={styles.changeFeeBadge}
                        onPress={() => handleOpenFeeModal(order)}
                      >
                        <Ionicons name="pencil" size={11} color={COLORS.primary} style={{ marginRight: 2 }} />
                        <Text style={styles.changeFeeBadgeText}>Change Fee</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={[styles.financeValue, { color: order.deliveryCharge === 0 ? COLORS.success : COLORS.text }]}>
                    {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                  </Text>
                </View>

                <View style={[styles.financeRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Grand Total ({order.paymentMethod}):</Text>
                  <Text style={styles.totalValue}>₹{order.total}</Text>
                </View>
              </View>

              {/* --- ACTION BUTTONS --- */}
              <View style={styles.cardActionsContainer}>
                {/* 1. Pending Order: ACCEPT or REJECT or CHANGE DELIVERY CHARGE */}
                {order.status === 'Pending' && (
                  <View style={styles.pendingActionGrid}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptOrder(order)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.surface} style={{ marginRight: 6 }} />
                      <Text style={styles.acceptButtonText}>Accept Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleOpenRejectModal(order)}
                    >
                      <Ionicons name="close-circle" size={18} color={COLORS.surface} style={{ marginRight: 6 }} />
                      <Text style={styles.rejectButtonText}>Reject Order</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editFeeButton}
                      onPress={() => handleOpenFeeModal(order)}
                    >
                      <Ionicons name="bicycle" size={16} color={COLORS.primaryDark} style={{ marginRight: 4 }} />
                      <Text style={styles.editFeeButtonText}>Change Delivery Fee (₹{order.deliveryCharge})</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 2. Accepted Order: Advance to Preparing */}
                {order.status === 'Accepted' && (
                  <View style={styles.inProgressActionRow}>
                    <TouchableOpacity
                      style={[styles.advanceButton, { backgroundColor: '#8E24AA' }]}
                      onPress={() => handleAdvanceStatus(order.id, 'Preparing')}
                    >
                      <Ionicons name="restaurant-outline" size={16} color={COLORS.surface} style={{ marginRight: 4 }} />
                      <Text style={styles.advanceButtonText}>Mark Preparing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.feeSmallBtn}
                      onPress={() => handleOpenFeeModal(order)}
                    >
                      <Ionicons name="pencil" size={14} color={COLORS.primary} />
                      <Text style={styles.feeSmallBtnText}>Fee: ₹{order.deliveryCharge}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelSmallBtn}
                      onPress={() => handleOpenRejectModal(order)}
                    >
                      <Ionicons name="close" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3. Preparing Order: Advance to Ready */}
                {order.status === 'Preparing' && (
                  <View style={styles.inProgressActionRow}>
                    <TouchableOpacity
                      style={[styles.advanceButton, { backgroundColor: '#00897B' }]}
                      onPress={() => handleAdvanceStatus(order.id, 'Ready')}
                    >
                      <Ionicons name="cube-outline" size={16} color={COLORS.surface} style={{ marginRight: 4 }} />
                      <Text style={styles.advanceButtonText}>Mark Ready for Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.feeSmallBtn}
                      onPress={() => handleOpenFeeModal(order)}
                    >
                      <Ionicons name="pencil" size={14} color={COLORS.primary} />
                      <Text style={styles.feeSmallBtnText}>Fee: ₹{order.deliveryCharge}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 4. Ready Order: Advance to Out for Delivery */}
                {order.status === 'Ready' && (
                  <View style={styles.inProgressActionRow}>
                    <TouchableOpacity
                      style={[styles.advanceButton, { backgroundColor: COLORS.accentWarm }]}
                      onPress={() => handleAdvanceStatus(order.id, 'Out for Delivery')}
                    >
                      <Ionicons name="bicycle-outline" size={16} color={COLORS.surface} style={{ marginRight: 4 }} />
                      <Text style={styles.advanceButtonText}>Dispatch / Out for Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.feeSmallBtn}
                      onPress={() => handleOpenFeeModal(order)}
                    >
                      <Ionicons name="pencil" size={14} color={COLORS.primary} />
                      <Text style={styles.feeSmallBtnText}>Fee: ₹{order.deliveryCharge}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 5. Out for Delivery: Advance to Delivered */}
                {order.status === 'Out for Delivery' && (
                  <View style={styles.inProgressActionRow}>
                    <TouchableOpacity
                      style={[styles.advanceButton, { backgroundColor: COLORS.success, flex: 1 }]}
                      onPress={() => handleAdvanceStatus(order.id, 'Delivered')}
                    >
                      <Ionicons name="checkmark-done" size={18} color={COLORS.surface} style={{ marginRight: 6 }} />
                      <Text style={styles.advanceButtonText}>Mark Order Delivered (Complete)</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 6. Delivered / Cancelled Terminal Badges */}
                {order.status === 'Delivered' && (
                  <View style={styles.completedBadgeRow}>
                    <Ionicons name="checkmark-done-circle" size={18} color={COLORS.success} style={{ marginRight: 4 }} />
                    <Text style={styles.completedBadgeText}>Order Delivered Successfully</Text>
                  </View>
                )}

                {(order.status === 'Cancelled' || order.status === 'Rejected') && (
                  <View style={styles.rejectedBadgeRow}>
                    <Ionicons name="close-circle" size={18} color={COLORS.danger} style={{ marginRight: 4 }} />
                    <Text style={styles.rejectedBadgeText}>Order Cancelled / Rejected</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ============================================================== */}
      {/* CHANGE DELIVERY CHARGE MODAL                                    */}
      {/* ============================================================== */}
      <Modal visible={feeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="bicycle" size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Change Delivery Charge</Text>
              </View>
              <TouchableOpacity onPress={() => setFeeModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {targetOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalSub}>
                  Adjust the delivery fee for Order #{targetOrder.id} ({targetOrder.customerName}).
                </Text>

                <View style={styles.modalSummaryBox}>
                  <Text style={styles.modalSummaryLine}>Items Subtotal: <Text style={{ fontWeight: 'bold' }}>₹{targetOrder.subtotal}</Text></Text>
                  <Text style={styles.modalSummaryLine}>Current Fee: <Text style={{ fontWeight: 'bold' }}>₹{targetOrder.deliveryCharge}</Text></Text>
                  <Text style={styles.modalSummaryLine}>Delivery To: <Text style={{ color: COLORS.textMuted }}>{targetOrder.address.fullAddress}</Text></Text>
                </View>

                {/* Quick Preset Buttons */}
                <Text style={styles.presetLabel}>Quick Select Fee:</Text>
                <View style={styles.presetGrid}>
                  {[0, 20, 30, 40, 50, 80, 100].map(amt => (
                    <TouchableOpacity
                      key={amt}
                      style={[
                        styles.presetChip,
                        parseFloat(newFeeInput) === amt && styles.activePresetChip,
                      ]}
                      onPress={() => setNewFeeInput(amt.toString())}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          parseFloat(newFeeInput) === amt && styles.activePresetChipText,
                        ]}
                      >
                        {amt === 0 ? 'FREE (₹0)' : `₹${amt}`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Delivery Charge Input */}
                <Text style={styles.presetLabel}>Or Enter Custom Delivery Fee (₹):</Text>
                <View style={styles.customFeeRow}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    style={styles.customFeeInput}
                    value={newFeeInput}
                    onChangeText={setNewFeeInput}
                    keyboardType="numeric"
                    placeholder="30"
                  />
                </View>

                {/* Calculated New Total Preview */}
                <View style={styles.newTotalPreviewBox}>
                  <Text style={styles.newTotalLabel}>New Order Total:</Text>
                  <Text style={styles.newTotalValue}>
                    ₹{(targetOrder.subtotal + (parseFloat(newFeeInput) || 0))}
                  </Text>
                </View>

                {/* Save Action */}
                <TouchableOpacity
                  style={styles.saveFeeBtn}
                  onPress={handleSaveDeliveryFee}
                  disabled={isUpdatingFee}
                >
                  <Text style={styles.saveFeeBtnText}>
                    {isUpdatingFee ? 'Saving...' : 'Save & Update Delivery Charge'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setFeeModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* REJECT ORDER CONFIRMATION MODAL                                */}
      {/* ============================================================== */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={24} color={COLORS.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: COLORS.danger }]}>Reject Order</Text>
              </View>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {orderToReject && (
              <View>
                <Text style={styles.modalSub}>
                  Are you sure you want to reject <Text style={{ fontWeight: 'bold' }}>Order #{orderToReject.id}</Text> placed by <Text style={{ fontWeight: 'bold' }}>{orderToReject.customerName}</Text>?
                </Text>

                <View style={styles.stockNoticeBox}>
                  <Ionicons name="refresh-circle" size={20} color={COLORS.accentWarm} style={{ marginRight: 6 }} />
                  <Text style={styles.stockNoticeText}>
                    All {orderToReject.items.length} items ({orderToReject.items.reduce((s, i) => s + i.quantity, 0)} units) will automatically be returned to inventory stock.
                  </Text>
                </View>

                <Text style={styles.presetLabel}>Select Reason for Rejection:</Text>
                {[
                  'Items temporarily out of stock',
                  'Delivery address is outside service distance',
                  'Store closed or high rush',
                  'Customer requested order cancellation',
                ].map((reason, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.reasonRow,
                      rejectReason === reason && styles.activeReasonRow,
                    ]}
                    onPress={() => setRejectReason(reason)}
                  >
                    <Ionicons
                      name={rejectReason === reason ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={rejectReason === reason ? COLORS.danger : COLORS.textMuted}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.reasonText, rejectReason === reason && styles.activeReasonText]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.confirmRejectBtn}
                  onPress={handleConfirmReject}
                  disabled={isRejecting}
                >
                  <Text style={styles.confirmRejectBtnText}>
                    {isRejecting ? 'Rejecting...' : 'Yes, Confirm Rejection'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setRejectModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Keep Order (Cancel)</Text>
                </TouchableOpacity>
              </View>
            )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  topBarLeft: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  topBarSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  settingsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  settingsLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  toastText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  activeFilterTabText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: SPACING.md,
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.xl,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  custInfo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  addressBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 16,
  },
  itemsSummary: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  itemsSummaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  itemLine: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 6,
  },
  financialBox: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.xs,
    marginTop: 4,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  financeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  financeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  changeFeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE0B2',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  changeFeeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 6,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  cardActionsContainer: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.sm,
  },
  pendingActionGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
  },
  editFeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editFeeButtonText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  inProgressActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  advanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  advanceButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  feeSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  feeSmallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 3,
  },
  cancelSmallBtn: {
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  completedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    borderRadius: 8,
  },
  completedBadgeText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    borderRadius: 8,
  },
  rejectedBadgeText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    lineHeight: 16,
  },
  modalSummaryBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  modalSummaryLine: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 2,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
    marginBottom: 6,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  presetChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  activePresetChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  activePresetChipText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  customFeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginRight: 6,
  },
  customFeeInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  newTotalPreviewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: SPACING.sm,
    borderRadius: 8,
    marginVertical: SPACING.sm,
  },
  newTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.success,
  },
  newTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.success,
  },
  saveFeeBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveFeeBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmRejectBtn: {
    backgroundColor: COLORS.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  confirmRejectBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelBtnText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  stockNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: SPACING.sm,
    borderRadius: 8,
    marginVertical: SPACING.xs,
  },
  stockNoticeText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    flex: 1,
    lineHeight: 15,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  activeReasonRow: {
    backgroundColor: '#FFEBEE',
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.text,
  },
  activeReasonText: {
    color: COLORS.danger,
    fontWeight: '600',
  },
});
