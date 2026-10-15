import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Switch, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../../../src/constants/theme';
import { useLanguage } from '../../../../src/context/LanguageContext';
import { Header } from '../../../../src/components/Header';
import { productService } from '../../../../src/services/productService';
import { Product } from '../../../../src/types';
import { autoSelectProductImage } from '../../../../src/utils/imageMatcher';
import { ImagePickerWidget } from '../../../../src/components/ImagePickerWidget';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { language, t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameTe, setNameTe] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      productService.getProductById(id).then(p => {
        if (p) {
          setProduct(p);
          setNameEn(p.nameEn);
          setNameTe(p.nameTe);
          setPrice(p.price.toString());
          setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
          setStock(p.stock.toString());
          setUnit(p.unit);
          setImage(p.image);
          setIsActive(p.isActive);
          setIsFeatured(p.isFeatured);
        }
      });
    }
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Header showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!nameEn.trim() || !price.trim() || !stock.trim()) {
      Alert.alert(t('error'), 'Please fill in product name, price, and stock.');
      return;
    }

    const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    const cleanDiscount = discountPrice ? (parseFloat(discountPrice.replace(/[^0-9.]/g, '')) || undefined) : undefined;
    const cleanStock = parseInt(stock.replace(/[^0-9]/g, ''), 10) || 1;
    const finalImage = image.trim() || autoSelectProductImage(nameEn || nameTe);

    setIsSubmitting(true);
    await productService.updateProduct(product.id, {
      nameEn,
      nameTe: nameTe || nameEn,
      price: cleanPrice,
      discountPrice: cleanDiscount,
      stock: cleanStock,
      unit: unit || '1 Packet',
      image: finalImage,
      isActive,
      isFeatured,
    });
    setIsSubmitting(false);

    if (Platform.OS === 'web') {
      window.alert('Product updated successfully!');
      router.replace('/(vendor)/products');
    } else {
      Alert.alert(t('success'), 'Product updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(vendor)/products') },
      ]);
    }
  };

  const handleDelete = () => {
    const confirmMessage = `Are you sure you want to delete "${nameEn}" from the store catalog?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        productService.deleteProduct(product.id).then(() => {
          window.alert('Product deleted successfully.');
          router.replace('/(vendor)/products');
        });
      }
    } else {
      Alert.alert(
        t('deleteProduct'),
        confirmMessage,
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('deleteProduct'),
            style: 'destructive',
            onPress: async () => {
              await productService.deleteProduct(product.id);
              router.replace('/(vendor)/products');
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('editProduct')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Custom Image Upload & Picker Widget */}
        <ImagePickerWidget
          currentImage={image}
          onImageChange={setImage}
          productName={nameEn || nameTe}
          language={language}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('nameEn')}</Text>
          <TextInput style={styles.input} value={nameEn} onChangeText={setNameEn} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('nameTe')}</Text>
          <TextInput style={styles.input} value={nameTe} onChangeText={setNameTe} />
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>{t('priceLabel')}</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Discount Price</Text>
            <TextInput style={styles.input} value={discountPrice} onChangeText={setDiscountPrice} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>{t('stockLabel')}</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="number-pad" />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>{t('unit')}</Text>
            <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('activeStatus')}</Text>
          <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: COLORS.primary }} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('featuredStatus')}</Text>
          <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ true: COLORS.primary }} />
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={isSubmitting}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.surface} style={{ marginRight: 6 }} />
          <Text style={styles.saveBtnText}>{isSubmitting ? t('loading') : t('saveChanges')}</Text>
        </TouchableOpacity>

        {/* Delete Product Button */}
        <TouchableOpacity style={styles.deleteProductBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={COLORS.danger} style={{ marginRight: 6 }} />
          <Text style={styles.deleteProductBtnText}>Delete This Product</Text>
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
    marginTop: SPACING.sm,
  },
  saveBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteProductBtn: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  deleteProductBtnText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
