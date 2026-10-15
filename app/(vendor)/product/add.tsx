import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../src/constants/theme';
import { useLanguage } from '../../../src/context/LanguageContext';
import { Header } from '../../../src/components/Header';
import { productService } from '../../../src/services/productService';
import { autoSelectProductImage } from '../../../src/utils/imageMatcher';
import { ImagePickerWidget } from '../../../src/components/ImagePickerWidget';

export default function AddProductScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionTe, setDescriptionTe] = useState('');
  const [category, setCategory] = useState('kirana');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('50');
  const [unit, setUnit] = useState('1 kg Packet');
  const [image, setImage] = useState('');
  const [isAutoMatched, setIsAutoMatched] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-match image whenever product name changes (if user hasn't uploaded a custom photo)
  useEffect(() => {
    if (isAutoMatched && !image.startsWith('data:')) {
      const matchedUrl = autoSelectProductImage(nameEn || nameTe);
      setImage(matchedUrl);
    }
  }, [nameEn, nameTe, isAutoMatched]);

  const handleSave = async () => {
    if (!nameEn.trim() || !price.trim() || !stock.trim()) {
      Alert.alert(t('error'), 'Please fill in English product name, price, and stock.');
      return;
    }

    const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const cleanDiscount = discountPrice ? (parseFloat(discountPrice.replace(/[^0-9.]/g, '')) || undefined) : undefined;
    const cleanStock = parseInt(stock.replace(/[^0-9]/g, ''), 10) || 10;
    const finalImage = image.trim() || autoSelectProductImage(nameEn || nameTe);

    setIsSubmitting(true);
    await productService.addProduct({
      nameEn: nameEn.trim(),
      nameTe: nameTe.trim() || nameEn.trim(),
      descriptionEn: descriptionEn.trim() || nameEn.trim(),
      descriptionTe: descriptionTe.trim() || nameTe.trim() || nameEn.trim(),
      category,
      price: cleanPrice,
      discountPrice: cleanDiscount,
      stock: cleanStock,
      unit: unit.trim() || '1 Packet',
      image: finalImage,
      isActive,
      isFeatured,
    });
    setIsSubmitting(false);

    if (Platform.OS === 'web') {
      window.alert('New product added successfully!');
      router.replace('/(vendor)/products');
    } else {
      Alert.alert(t('success'), 'New product added successfully!', [
        { text: 'OK', onPress: () => router.replace('/(vendor)/products') },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('addProduct')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Custom Image Upload & Picker Widget */}
        <ImagePickerWidget
          currentImage={image}
          onImageChange={newUrl => {
            setImage(newUrl);
            setIsAutoMatched(false);
          }}
          productName={nameEn || nameTe}
          language={language}
        />

        {/* Product Names */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('nameEn')} * (e.g. "Mysore Sandal Soap", "Rice")</Text>
          <TextInput
            style={styles.input}
            value={nameEn}
            onChangeText={text => {
              setNameEn(text);
              if (!image.startsWith('data:')) setIsAutoMatched(true);
            }}
            placeholder="e.g. Freedom Refined Sunflower Oil"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('nameTe')}</Text>
          <TextInput
            style={styles.input}
            value={nameTe}
            onChangeText={text => {
              setNameTe(text);
              if (!image.startsWith('data:')) setIsAutoMatched(true);
            }}
            placeholder="ఉదా: సన్‌ఫ్లవర్ ఆయిల్ / సబ్బు"
          />
        </View>

        {/* Prices & Units (Vertical Stack) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('priceLabel')} * (₹)</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="180"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Discount Price (Optional) (₹)</Text>
          <TextInput
            style={styles.input}
            value={discountPrice}
            onChangeText={setDiscountPrice}
            keyboardType="numeric"
            placeholder="170"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('stockLabel')} * (Available Units)</Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
            placeholder="50"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('unit')} (e.g. 1 Litre Pouch, 1 kg, 1 Piece)</Text>
          <TextInput
            style={styles.input}
            value={unit}
            onChangeText={setUnit}
            placeholder="1 Litre Pouch / 1 Piece"
          />
        </View>

        {/* Category Choice */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('categoryLabel')}</Text>
          <View style={styles.catChipsRow}>
            {['kirana', 'cooking_oils', 'pelli_sarukulu', 'pickles', 'festival_supplies', 'daily_essentials'].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.activeCatChip]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catChipText, category === cat && styles.activeCatChipText]}>
                  {cat.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggles */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('activeStatus')}</Text>
          <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: COLORS.primary }} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('featuredStatus')}</Text>
          <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ true: COLORS.primary }} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSubmitting}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.surface} style={{ marginRight: 6 }} />
          <Text style={styles.saveBtnText}>{isSubmitting ? t('loading') : 'Add Product Now'}</Text>
        </TouchableOpacity>
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
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 768,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  catChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCatChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeCatChipText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: SPACING.md,
  },
  saveBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
