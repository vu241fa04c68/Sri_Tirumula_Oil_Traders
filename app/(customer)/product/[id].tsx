import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../src/constants/theme';
import { useLanguage } from '../../../src/context/LanguageContext';
import { useCart } from '../../../src/context/CartContext';
import { Header } from '../../../src/components/Header';
import { CallShopButton } from '../../../src/components/CallShopButton';
import { productService } from '../../../src/services/productService';
import { Product } from '../../../src/types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (id) {
      productService.getProductById(id).then(setProduct);
    }
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack />
        <View style={styles.loadingContainer}>
          <Text>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const title = language === 'te' ? product.nameTe : product.nameEn;
  const secondaryTitle = language === 'te' ? product.nameEn : product.nameTe;
  const description = language === 'te' ? product.descriptionTe : product.descriptionEn;
  const activePrice = product.discountPrice || product.price;

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      Alert.alert(t('error'), t('outOfStockAlert'));
      return;
    }
    const res = addToCart(product, quantity);
    if (res.success) {
      Alert.alert(t('success'), t('addedToCart'), [
        { text: t('startShopping'), style: 'cancel' },
        { text: t('cart'), onPress: () => router.push('/(customer)/cart') },
      ]);
    } else if (res.message) {
      Alert.alert(t('error'), res.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={title} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
        </View>

        {/* Product Meta */}
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.secondaryTitle}>{secondaryTitle}</Text>

          <View style={styles.unitRow}>
            <Text style={styles.unitTag}>{product.unit}</Text>

            {product.stock <= 0 ? (
              <View style={styles.outBadge}>
                <Text style={styles.badgeText}>{t('outOfStock')}</Text>
              </View>
            ) : (
              <View style={styles.inStockBadge}>
                <Text style={styles.inStockText}>
                  {t('inStock')} ({product.stock} left)
                </Text>
              </View>
            )}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.activePrice}>₹{activePrice}</Text>
            {product.discountPrice && (
              <Text style={styles.mrp}>₹{product.price}</Text>
            )}
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>{t('quantity')}</Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={COLORS.text} />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              <Ionicons name="add" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>{t('description')}</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {/* Bulk Query Action */}
        <View style={styles.bulkBox}>
          <Text style={styles.bulkTitle}>Ordering for Wedding / Function?</Text>
          <Text style={styles.bulkSub}>Contact shop directly for bulk wholesale discounts</Text>
          <CallShopButton variant="compact" />
        </View>
      </ScrollView>

      {/* Bottom Sticky Add to Cart Action Bar */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerPriceCol}>
          <Text style={styles.footerTotalLabel}>{t('subtotal')}</Text>
          <Text style={styles.footerTotalPrice}>₹{activePrice * quantity}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addToCartBtn, product.stock <= 0 && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <Ionicons name="cart" size={20} color={COLORS.surface} style={{ marginRight: 6 }} />
          <Text style={styles.addToCartBtnText}>{t('addToCart')}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 95,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  imageContainer: {
    height: 240,
    backgroundColor: COLORS.surface,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  secondaryTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  unitTag: {
    backgroundColor: COLORS.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: SPACING.sm,
  },
  inStockBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  inStockText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
  outBadge: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  activePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginRight: SPACING.md,
  },
  mrp: {
    fontSize: 16,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: SPACING.lg,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  bulkBox: {
    backgroundColor: '#FFF8E1',
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  bulkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  bulkSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginVertical: 6,
  },
  stickyFooter: {
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
    maxWidth: 768,
    alignSelf: 'center',
  },
  footerPriceCol: {},
  footerTotalLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  footerTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addToCartBtnText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
  disabledBtn: {
    backgroundColor: COLORS.textMuted,
  },
});
