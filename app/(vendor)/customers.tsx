import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants/theme';
import { Header } from '../../src/components/Header';
import { orderService } from '../../src/services/orderService';
import { Order } from '../../src/types';

interface CustomerSummary {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export default function VendorCustomersScreen() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);

  useEffect(() => {
    orderService.getAllOrders().then(orders => {
      const map = new Map<string, CustomerSummary>();

      orders.forEach(o => {
        const phone = o.customerPhone || 'N/A';
        const existing = map.get(phone);

        if (existing) {
          existing.orderCount += 1;
          existing.totalSpent += o.total;
        } else {
          map.set(phone, {
            name: o.customerName,
            phone,
            orderCount: 1,
            totalSpent: o.total,
            lastOrderDate: o.createdAt,
          });
        }
      });

      setCustomers(Array.from(map.values()));
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Registered Customers" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Total Store Customers ({customers.length})</Text>

        {customers.map((c, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>

            <View style={styles.infoCol}>
              <Text style={styles.custName}>{c.name}</Text>
              <Text style={styles.custPhone}>📞 {c.phone}</Text>
              <Text style={styles.dateText}>Last Order: {new Date(c.lastOrderDate).toLocaleDateString()}</Text>
            </View>

            <View style={styles.statsCol}>
              <Text style={styles.ordersBadge}>{c.orderCount} Orders</Text>
              <Text style={styles.totalValue}>₹{c.totalSpent.toLocaleString()}</Text>
            </View>
          </View>
        ))}
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  custName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  custPhone: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsCol: {
    alignItems: 'flex-end',
  },
  ordersBadge: {
    backgroundColor: '#E8F5E9',
    color: COLORS.success,
    fontSize: 11,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
});
