import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { Header } from '../../src/components/Header';
import { ProductCard } from '../../src/components/ProductCard';
import { CallShopButton } from '../../src/components/CallShopButton';
import { productService } from '../../src/services/productService';
import { Product, Category } from '../../src/types';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [cookingOils, setCookingOils] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    const cats = await productService.getCategories();
    const prods = await productService.getProducts(true);

    setCategories(cats);
    setFeaturedProducts(prods.filter(p => p.isFeatured));
    setCookingOils(prods.filter(p => p.category === 'cooking_oils'));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Search Trigger Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.9}
        >
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>{t('searchPlaceholder')}</Text>
        </TouchableOpacity>

        {/* Hero Promo Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.bannerTextCol}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>
                {language === 'te' ? 'ఉచిత డెలివరీ' : 'FREE Home Delivery'}
              </Text>
            </View>
            <Text style={styles.bannerTitle}>
              {language === 'te'
                ? 'స్వచ్ఛమైన వంట నూనెలు & కిరాణా సరుకులు'
                : '100% Pure Cooking Oils & Fresh Kirana'}
            </Text>
            <Text style={styles.bannerSub}>
              {language === 'te'
                ? 'రూ. 1000 పైబడి ఆర్డర్లపై ఉచిత డెలివరీ'
                : 'Free local delivery on orders above ₹1000'}
            </Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('categories')}</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/categories')}>
            <Text style={styles.viewAllText}>{t('viewAll')} →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              onPress={() => router.push({ pathname: '/(customer)/categories', params: { selectedCat: cat.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.catIconCircle}>
                <Ionicons
                  name={cat.id === 'cooking_oils' ? 'water-outline' : cat.id === 'pickles' ? 'leaf' : 'bag-handle'}
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.catName} numberOfLines={2}>
                {language === 'te' ? cat.nameTe : cat.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Products Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {language === 'te' ? 'ముఖ్యమైన ఉత్పత్తులు' : 'Featured Products'}
          </Text>
        </View>

        <View style={styles.gridContainer}>
          {featuredProducts.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onPress={() => router.push(`/(customer)/product/${prod.id}`)}
            />
          ))}
        </View>

        {/* Cooking Oils Special Highlight */}
        <View style={[styles.sectionHeader, { marginTop: SPACING.md }]}>
          <Text style={styles.sectionTitle}>{t('catCookingOils')}</Text>
        </View>

        {cookingOils.map(prod => (
          <ProductCard
            key={prod.id}
            product={prod}
            horizontal
            onPress={() => router.push(`/(customer)/product/${prod.id}`)}
          />
        ))}

        {/* Call Shop & Bulk Orders Card */}
        <View style={styles.callShopCard}>
          <View style={styles.callCardHeader}>
            <Ionicons name="call" size={26} color={COLORS.success} />
            <Text style={styles.callCardTitle}>{t('contactShop')}</Text>
          </View>
          <Text style={styles.callCardText}>
            {language === 'te'
              ? 'పెళ్లి సరుకులు & హోల్‌సేల్ నూనెల ఆర్డర్ల కోసం నేరుగా యజమానికి కాల్ చేయండి'
              : 'For Wedding Supplies (Pelli Sarukulu) & Bulk Oils, call shop owner directly.'}
          </Text>
          <CallShopButton />
        </View>
      </ScrollView>

      {/* Floating Bottom Nav Quick Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomTabActive} onPress={() => router.push('/(customer)/home')}>
          <Ionicons name="home" size={20} color={COLORS.primary} />
          <Text style={styles.bottomTabActiveText}>{t('home')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/(customer)/categories')}>
          <Ionicons name="grid-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.bottomTabText}>{t('categories')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/(customer)/orders')}>
          <Ionicons name="cube-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.bottomTabText}>{t('orders')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTab} onPress={() => router.push('/(customer)/profile')}>
          <Ionicons name="storefront-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.bottomTabText}>{language === 'te' ? 'స్టోర్ సమాచారం' : 'Store Info'}</Text>
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  heroBanner: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  bannerTextCol: {
    alignItems: 'flex-start',
  },
  tagBadge: {
    backgroundColor: COLORS.accent,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  tagBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  bannerTitle: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSub: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  viewAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  catsRow: {
    paddingRight: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  catCard: {
    backgroundColor: COLORS.surface,
    width: 90,
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  catName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  callShopCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
  },
  callCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  callCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  callCardText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
  },
  bottomTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabActive: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bottomTabActiveText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  customerInfoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F8',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#F3C6C6',
    marginBottom: SPACING.sm,
  },
  customerAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerTextCol: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  customerGreeting: {
    fontSize: 13,
    color: COLORS.text,
  },
  customerNameBold: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  customerSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  editBadgeText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
