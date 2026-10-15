import { db } from './firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Category } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './seedData';
import { autoSelectProductImage } from '../utils/imageMatcher';

let localProducts: Product[] = [...INITIAL_PRODUCTS];
let localCategories: Category[] = [...INITIAL_CATEGORIES];
let isLoadedFromStorage = false;

// Non-blocking background Firestore writer (zero UI delay, zero red error screens)
const safeFirestoreWrite = (writeFn: () => Promise<any>) => {
  try {
    writeFn().catch(err => {
      console.log('Background Firestore sync note:', err?.message || err);
    });
  } catch (e) {}
};

const loadStorageProducts = async () => {
  if (isLoadedFromStorage) return;
  try {
    const saved = await AsyncStorage.getItem('store_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localProducts = parsed.map((p: Product) => {
          // Auto-fix generic image URLs with precise item photos
          if (!p.image || p.image.includes('photo-1542838132-92c53300491e')) {
            const matched = autoSelectProductImage(p.nameEn || p.nameTe);
            return { ...p, image: matched };
          }
          return p;
        });
      }
    }
  } catch (e) {
    console.log('Error reading products from storage:', e);
  }
  isLoadedFromStorage = true;
};

const saveStorageProducts = async (products: Product[]) => {
  localProducts = products;
  try {
    await AsyncStorage.setItem('store_products', JSON.stringify(products));
  } catch (e) {
    console.log('Error saving products to storage:', e);
  }
};

export const productService = {
  // Get all active categories
  getCategories: async (): Promise<Category[]> => {
    return localCategories;
  },

  // Get all products (with optional active filter)
  getProducts: async (onlyActive = true): Promise<Product[]> => {
    await loadStorageProducts();
    // Ensure all products have fuzzy matched images
    const sanitized = localProducts.map(p => {
      if (!p.image || p.image.includes('photo-1542838132-92c53300491e')) {
        return { ...p, image: autoSelectProductImage(p.nameEn || p.nameTe) };
      }
      return p;
    });
    return onlyActive ? sanitized.filter(p => p.isActive) : sanitized;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const all = await productService.getProducts(true);
    return all.filter(p => p.category === categoryId);
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    await loadStorageProducts();
    const found = localProducts.find(p => p.id === id);
    if (found && (!found.image || found.image.includes('photo-1542838132-92c53300491e'))) {
      found.image = autoSelectProductImage(found.nameEn || found.nameTe);
    }
    return found || null;
  },

  // Search products by English or Telugu name
  searchProducts: async (queryStr: string): Promise<Product[]> => {
    const all = await productService.getProducts(true);
    const q = queryStr.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      p =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameTe.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q) ||
        p.descriptionTe.toLowerCase().includes(q)
    );
  },

  // Add new product (Vendor action)
  addProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    await loadStorageProducts();
    const now = new Date().toISOString();
    const newId = 'prod_' + Date.now();

    // Auto-select exact photo matching the name if image is generic or default
    let assignedImage = productData.image;
    if (!assignedImage || assignedImage.includes('photo-1542838132-92c53300491e')) {
      assignedImage = autoSelectProductImage(productData.nameEn || productData.nameTe);
    }

    const newProduct: Product = {
      ...productData,
      image: assignedImage,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      safeFirestoreWrite(() => setDoc(doc(db, 'products', newId), newProduct));
    }

    const updated = [newProduct, ...localProducts];
    await saveStorageProducts(updated);
    return newProduct;
  },

  // Update existing product (Vendor action)
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    await loadStorageProducts();
    const now = new Date().toISOString();
    const patch = { ...updates, updatedAt: now };

    if (db) {
      safeFirestoreWrite(() => updateDoc(doc(db, 'products', id), patch));
    }

    const index = localProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedList = [...localProducts];
      updatedList[index] = { ...updatedList[index], ...patch };
      await saveStorageProducts(updatedList);
      return updatedList[index];
    }
    return null;
  },

  // Update stock level specifically
  updateStock: async (id: string, newStock: number): Promise<boolean> => {
    const res = await productService.updateProduct(id, { stock: newStock });
    return !!res;
  },

  // Delete / deactivate product
  deleteProduct: async (id: string): Promise<boolean> => {
    await loadStorageProducts();
    if (db) {
      safeFirestoreWrite(() => deleteDoc(doc(db, 'products', id)));
    }
    const filtered = localProducts.filter(p => p.id !== id);
    await saveStorageProducts(filtered);
    return true;
  },

  // Reset to seed data (for testing / demo)
  resetToSeedData: async () => {
    await saveStorageProducts([...INITIAL_PRODUCTS]);
    localCategories = [...INITIAL_CATEGORIES];
    return true;
  },
};
