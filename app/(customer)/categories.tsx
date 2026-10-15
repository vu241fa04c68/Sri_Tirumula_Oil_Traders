import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Header } from '../../src/components/Header';
import { ProductCard } from '../../src/components/ProductCard';
import { productService } from '../../src/services/productService';
import { Category, Product } from '../../src/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const { selectedCat } = useLocalSearchParams<{ selectedCat?: string }>();
  const { language, t } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getCategories().then(cats => {
      setCategories(cats);
      if (selectedCat) {
        setActiveCategory(selectedCat);
      }
    });
  }, [selectedCat]);

  useEffect(() => {
    if (activeCategory === 'all') {
      productService.getProducts(true).then(setProducts);
    } else {
      productService.getProductsByCategory(activeCategory).then(setProducts);
    }
  }, [activeCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('categories')} />

      {/* Category Selection Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <TouchableOpacity
          style={[styles.tab, activeCategory === 'all' && styles.activeTab]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.tabText, activeCategory === 'all' && styles.activeTabText]}>
            {t('viewAll')}
          </Text>
        </TouchableOpacity>

        {categories.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {language === 'te' ? cat.nameTe : cat.nameEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Product List */}
      <ScrollView contentContainerStyle={styles.productList}>
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found in this category.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {products.map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                onPress={() => router.push(`/(customer)/product/${prod.id}`)}
              />
            ))}
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
  tabScroll: {
    maxHeight: 50,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginRight: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  productList: {
    padding: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
