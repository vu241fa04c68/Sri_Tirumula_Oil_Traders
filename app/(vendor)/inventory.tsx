import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Header } from '../../src/components/Header';
import { productService } from '../../src/services/productService';
import { Product } from '../../src/types';

export default function VendorInventoryScreen() {
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    const data = await productService.getProducts(false);
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleAdjustStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    await productService.updateStock(product.id, newStock);
    await loadProducts();
  };

  const handleDeleteProduct = (product: Product) => {
    const confirmMsg = `Are you sure you want to delete "${product.nameEn}" from inventory?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        productService.deleteProduct(product.id).then(() => {
          loadProducts();
        });
      }
    } else {
      productService.deleteProduct(product.id).then(() => {
        loadProducts();
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('inventoryStock')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <Text style={styles.sectionHeader}>Quick Stock Adjustments & Delete</Text>

        {products.map(prod => {
          const isOut = prod.stock <= 0;
          const isLow = prod.stock <= 5;

          return (
            <View key={prod.id} style={styles.itemRow}>
              <View style={styles.infoCol}>
                <Text style={styles.itemTitle} numberOfLines={1}>{prod.nameEn}</Text>
                <Text style={styles.itemTe}>{prod.nameTe}</Text>

                <View style={styles.badgeRow}>
                  {isOut ? (
                    <View style={styles.outBadge}>
                      <Text style={styles.badgeText}>{t('outOfStock')}</Text>
                    </View>
                  ) : isLow ? (
                    <View style={styles.lowBadge}>
                      <Text style={styles.badgeText}>{t('lowStock')}</Text>
                    </View>
                  ) : (
                    <View style={styles.inBadge}>
                      <Text style={styles.badgeText}>{t('inStock')}</Text>
                    </View>
                  )}
                  <Text style={styles.unitText}>{prod.unit}</Text>
                </View>
              </View>

              {/* Quick Controls & Delete Button */}
              <View style={styles.controlsCol}>
                <View style={styles.stockHeaderRow}>
                  <Text style={styles.currentStock}>{prod.stock} <Text style={styles.stockLabel}>units</Text></Text>
                  <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleDeleteProduct(prod)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.adjBtn} onPress={() => handleAdjustStock(prod, -5)}>
                    <Text style={styles.adjBtnText}>-5</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.adjBtn} onPress={() => handleAdjustStock(prod, -1)}>
                    <Ionicons name="remove" size={14} color={COLORS.text} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.adjBtn} onPress={() => handleAdjustStock(prod, 1)}>
                    <Ionicons name="add" size={14} color={COLORS.text} />
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.adjBtn, styles.primaryAdjBtn]} onPress={() => handleAdjustStock(prod, 10)}>
                    <Text style={styles.primaryAdjBtnText}>+10</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  itemRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemTe: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  inBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  lowBadge: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  outBadge: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  controlsCol: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  stockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  currentStock: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  stockLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  deleteIconBtn: {
    padding: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  adjBtn: {
    backgroundColor: COLORS.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 26,
    alignItems: 'center',
  },
  adjBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  primaryAdjBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryAdjBtnText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
