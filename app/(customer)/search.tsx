import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { Header } from '../../src/components/Header';
import { ProductCard } from '../../src/components/ProductCard';
import { productService } from '../../src/services/productService';
import { Product } from '../../src/types';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [queryStr, setQueryStr] = useState<string>('');
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    productService.searchProducts(queryStr).then(setResults);
  }, [queryStr]);

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('search')} />

      <View style={styles.searchHeader}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={queryStr}
            onChangeText={setQueryStr}
            placeholder={t('searchPlaceholder')}
            autoFocus
          />
          {queryStr.length > 0 && (
            <TouchableOpacity onPress={() => setQueryStr('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No matching products found</Text>
            <Text style={styles.emptySub}>Try searching for "Rice", "Oil", "పసుపు", or "పచ్చడి"</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {results.map(prod => (
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
  searchHeader: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.xs,
    fontSize: 15,
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
