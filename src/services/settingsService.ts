import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SHOP_METADATA } from '../constants/theme';

export interface ShopSettings {
  shopName: string;
  shopPhone: string;
  address: string;
  defaultDeliveryCharge: number;
  freeDeliveryThreshold: number;
  minOrderAmount: number;
  isDeliveryAvailable: boolean;
}

const SETTINGS_STORAGE_KEY = '@shop_delivery_settings';
type Listener = (settings: ShopSettings) => void;

let listeners: Listener[] = [];
let cachedSettings: ShopSettings | null = null;

export const settingsService = {
  subscribe(listener: Listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  async getSettings(): Promise<ShopSettings> {
    if (cachedSettings) {
      return cachedSettings;
    }

    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        cachedSettings = JSON.parse(stored);
        return cachedSettings!;
      }
    } catch (e) {
      console.warn('Failed to load settings from AsyncStorage', e);
    }

    const defaultSettings: ShopSettings = {
      shopName: SHOP_METADATA.nameEn,
      shopPhone: SHOP_METADATA.phone,
      address: SHOP_METADATA.addressEn,
      defaultDeliveryCharge: SHOP_METADATA.defaultDeliveryCharge,
      freeDeliveryThreshold: SHOP_METADATA.freeDeliveryThreshold,
      minOrderAmount: SHOP_METADATA.minOrderAmount,
      isDeliveryAvailable: true,
    };

    cachedSettings = defaultSettings;
    return defaultSettings;
  },

  async saveSettings(newSettings: Partial<ShopSettings>): Promise<ShopSettings> {
    const current = await this.getSettings();
    const updated: ShopSettings = {
      ...current,
      ...newSettings,
    };

    cachedSettings = updated;
    listeners.forEach(l => l(updated));

    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('AsyncStorage save settings failed', e);
    }

    this.syncToFirestore(updated).catch(() => {});

    return updated;
  },

  async syncToFirestore(settings: ShopSettings) {
    try {
      const docRef = doc(db, 'settings', 'shopConfig');
      const writePromise = setDoc(docRef, settings, { merge: true });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore write timeout')), 2500)
      );
      await Promise.race([writePromise, timeoutPromise]);
    } catch (e) {
      console.log('Safe firestore write skipped:', e);
    }
  },
};
