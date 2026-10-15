import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert, Platform, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Header } from '../../src/components/Header';
import { productService } from '../../src/services/productService';
import { Product } from '../../src/types';

export default function VendorProductsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    const data = await productService.getProducts(false); // get all products including inactive
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleToggleActive = async (product: Product) => {
    await productService.updateProduct(product.id, { isActive: !product.isActive });
    await loadProducts();
  };

  const handleDelete = (product: Product) => {
    const confirmMsg = `Are you sure you want to delete "${product.nameEn}" from the store catalog?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        productService.deleteProduct(product.id).then(() => {
          loadProducts();
        });
      }
    } else {
      Alert.alert(
        t('deleteProduct'),
        confirmMsg,
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('deleteProduct'),
            style: 'destructive',
            onPress: async () => {
              await productService.deleteProduct(product.id);
              await loadProducts();
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('manageProducts')} />

      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <Text style={styles.countText}>Total Products: {products.length}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(vendor)/product/add')}>
          <Ionicons name="add" size={18} color={COLORS.surface} style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>{t('addProduct')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {products.map(product => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />

            <View style={styles.detailsCol}>
              <Text style={styles.titleEn}>{product.nameEn}</Text>
              <Text style={styles.titleTe}>{product.nameTe}</Text>
              <Text style={styles.metaText}>
                Unit: {product.unit} • Category: {product.category}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{product.discountPrice || product.price}</Text>
                <Text style={[styles.stockTag, product.stock <= 5 && styles.lowStockTag]}>
                  Stock: {product.stock}
                </Text>
              </View>
            </View>

            <View style={styles.actionsCol}>
              <TouchableOpacity
                style={[styles.toggleBtn, product.isActive ? styles.activeToggle : styles.inactiveToggle]}
                onPress={() => handleToggleActive(product)}
              >
                <Text style={styles.toggleText}>{product.isActive ? 'Active' : 'Disabled'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/(vendor)/product/edit/${product.id}`)}>
                <Ionicons name="pencil" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              {/* RED DELETE BUTTON */}
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(product)}>
                <Ionicons name="trash-bin" size={18} color={COLORS.danger} />
              </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.md,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  productImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
    backgroundColor: COLORS.borderLight,
  },
  detailsCol: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  titleEn: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  titleTe: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stockTag: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  lowStockTag: {
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  actionsCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  toggleBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#E8F5E9',
  },
  inactiveToggle: {
    backgroundColor: '#FFEBEE',
  },
  toggleText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  editBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
  },
});
