import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { COLORS, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  horizontal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, horizontal = false }) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const title = language === 'te' ? product.nameTe : product.nameEn;
  const secondaryTitle = language === 'te' ? product.nameEn : product.nameTe;
  const activePrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      Alert.alert(t('error'), t('outOfStockAlert'));
      return;
    }
    const res = addToCart(product, 1);
    if (!res.success && res.message) {
      Alert.alert(t('error'), res.message);
    }
  };

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.cardHorizontal} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.imageHorizontalWrapper}>
          <Image source={{ uri: product.image }} style={styles.imageHorizontal} resizeMode="cover" />
          {hasDiscount && (
            <View style={styles.discountBadgeSmall}>
              <Text style={styles.discountTextSmall}>
                SAVE ₹{product.price - (product.discountPrice || 0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailsHorizontal}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.secondaryTitle} numberOfLines={1}>
            {secondaryTitle}
          </Text>
          <Text style={styles.unitText}>{product.unit}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{activePrice}</Text>
            {hasDiscount && <Text style={styles.mrp}>₹{product.price}</Text>}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addBtnHorizontal, product.stock <= 0 && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <Ionicons name="add" size={16} color={COLORS.surface} />
          <Text style={styles.addBtnHorizontalText}>
            {product.stock <= 0 ? t('outOfStock') : t('addToCart')}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.cardGrid} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.imageGrid} resizeMode="cover" />

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              SAVE ₹{product.price - (product.discountPrice || 0)}
            </Text>
          </View>
        )}

        {product.stock <= 0 ? (
          <View style={styles.stockBadgeOut}>
            <Text style={styles.stockText}>{t('outOfStock')}</Text>
          </View>
        ) : product.stock <= 5 ? (
          <View style={styles.stockBadgeLow}>
            <Text style={styles.stockText}>{t('lowStock')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.secondaryTitle} numberOfLines={1}>
          {secondaryTitle}
        </Text>
        <Text style={styles.unitText}>{product.unit}</Text>

        <View style={styles.footerRow}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>₹{activePrice}</Text>
            {hasDiscount && <Text style={styles.mrp}>₹{product.price}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.addBtnGrid, product.stock <= 0 && styles.disabledBtn]}
            onPress={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <Text style={styles.addBtnText}>{t('addToCart')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardGrid: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    flex: 1,
    minWidth: 150,
    maxWidth: 360,
    marginHorizontal: SPACING.xs,
  },
  imageWrapper: {
    position: 'relative',
    height: 140,
    backgroundColor: COLORS.borderLight,
  },
  imageGrid: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.surface,
    fontSize: 9,
    fontWeight: 'bold',
  },
  stockBadgeOut: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.badgeOutStock,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  stockBadgeLow: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.badgeLowStock,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  stockText: {
    color: COLORS.surface,
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: SPACING.sm,
    justifyContent: 'space-between',
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 18,
  },
  secondaryTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  unitText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceCol: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mrp: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtnGrid: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  addBtnText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  disabledBtn: {
    backgroundColor: COLORS.textMuted,
  },
  cardHorizontal: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  imageHorizontalWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.borderLight,
  },
  imageHorizontal: {
    width: '100%',
    height: '100%',
  },
  discountBadgeSmall: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    alignItems: 'center',
  },
  discountTextSmall: {
    color: COLORS.surface,
    fontSize: 8,
    fontWeight: '800',
  },
  detailsHorizontal: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  addBtnHorizontal: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 1,
  },
  addBtnHorizontalText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
});
