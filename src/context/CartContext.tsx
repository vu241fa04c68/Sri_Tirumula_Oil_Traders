import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Product } from '../types';
import { settingsService, ShopSettings } from '../services/settingsService';
import { SHOP_METADATA } from '../constants/theme';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, qty?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => { success: boolean; message?: string };
  clearCart: () => void;
  subtotal: number;
  deliveryCharge: number;
  grandTotal: number;
  itemCount: number;
  deliveryConfig: ShopSettings;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => ({ success: false }),
  removeFromCart: () => {},
  updateQuantity: () => ({ success: false }),
  clearCart: () => {},
  subtotal: 0,
  deliveryCharge: 0,
  grandTotal: 0,
  itemCount: 0,
  deliveryConfig: {
    shopName: SHOP_METADATA.nameEn,
    shopPhone: SHOP_METADATA.phone,
    address: SHOP_METADATA.addressEn,
    defaultDeliveryCharge: SHOP_METADATA.defaultDeliveryCharge,
    freeDeliveryThreshold: SHOP_METADATA.freeDeliveryThreshold,
    minOrderAmount: SHOP_METADATA.minOrderAmount,
    isDeliveryAvailable: true,
  },
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({
    shopName: SHOP_METADATA.nameEn,
    shopPhone: SHOP_METADATA.phone,
    address: SHOP_METADATA.addressEn,
    defaultDeliveryCharge: SHOP_METADATA.defaultDeliveryCharge,
    freeDeliveryThreshold: SHOP_METADATA.freeDeliveryThreshold,
    minOrderAmount: SHOP_METADATA.minOrderAmount,
    isDeliveryAvailable: true,
  });

  useEffect(() => {
    AsyncStorage.getItem('shopping_cart').then(saved => {
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {}
      }
    });

    settingsService.getSettings().then(setSettings);
    const unsubscribe = settingsService.subscribe(setSettings);
    return () => unsubscribe();
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    AsyncStorage.setItem('shopping_cart', JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantityToAdd = 1): { success: boolean; message?: string } => {
    const existingIndex = items.findIndex(item => item.product.id === product.id);
    const currentQty = existingIndex !== -1 ? items[existingIndex].quantity : 0;
    const requestedTotal = currentQty + quantityToAdd;

    if (requestedTotal > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} items in stock`,
      };
    }

    let updated: CartItem[];
    if (existingIndex !== -1) {
      updated = [...items];
      updated[existingIndex].quantity = requestedTotal;
    } else {
      updated = [...items, { product, quantity: quantityToAdd }];
    }

    saveCart(updated);
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    const updated = items.filter(item => item.product.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId: string, qty: number): { success: boolean; message?: string } => {
    if (qty <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const item = items.find(i => i.product.id === productId);
    if (item && qty > item.product.stock) {
      return {
        success: false,
        message: `Maximum available stock is ${item.product.stock}`,
      };
    }

    const updated = items.map(item =>
      item.product.id === productId ? { ...item, quantity: qty } : item
    );

    saveCart(updated);
    return { success: true };
  };

  const clearCart = () => {
    saveCart([]);
  };

  const subtotal = items.reduce((sum, item) => {
    const activePrice = item.product.discountPrice || item.product.price;
    return sum + activePrice * item.quantity;
  }, 0);

  const deliveryCharge =
    !settings.isDeliveryAvailable || subtotal === 0 || (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold)
      ? 0
      : settings.defaultDeliveryCharge;

  const grandTotal = subtotal + deliveryCharge;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryCharge,
        grandTotal,
        itemCount,
        deliveryConfig: settings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
