import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus, Address, OrderItem } from '../types';
import { productService } from './productService';

const ORDERS_STORAGE_KEY = '@sri_tirumala_orders_store_v1';

const safeFirestoreWrite = (writeFn: () => Promise<any>) => {
  try {
    writeFn().catch(err => {
      console.log('Background order sync note:', err?.message || err);
    });
  } catch (e) {}
};

// Sample initial order for demonstration & vendor testing
const SAMPLE_ORDER: Order = {
  id: 'ORD-1001',
  customerId: 'cust_01',
  customerName: 'K. Ramarao',
  customerPhone: '9848022338',
  items: [
    {
      productId: 'prod_oil_01',
      nameEn: 'Freedom Refined Sunflower Oil',
      nameTe: 'ఫ్రీడమ్ రిఫైన్డ్ సన్‌ఫ్లవర్ ఆయిల్',
      price: 128,
      quantity: 2,
      unit: '1 Litre Pouch',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80',
    },
    {
      productId: 'prod_rice_01',
      nameEn: 'Sona Masoori Raw Rice (12 Months Aged)',
      nameTe: 'సోనా మసూరి పాత బియ్యం (12 నెలలు)',
      price: 1380,
      quantity: 1,
      unit: '25 kg Bag',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80',
    },
  ],
  subtotal: 1636,
  deliveryCharge: 0,
  total: 1636,
  address: {
    id: 'addr_01',
    title: 'Home',
    fullAddress: 'Door No 4-12, Near Ramalayam Temple, Main Road',
    city: 'Local Town',
    pincode: '530001',
  },
  paymentMethod: 'COD',
  status: 'Accepted',
  statusHistory: [
    { status: 'Pending', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { status: 'Accepted', timestamp: new Date().toISOString() },
  ],
  createdAt: new Date(Date.now() - 3600000).toISOString(),
  updatedAt: new Date().toISOString(),
};

let localOrders: Order[] = [SAMPLE_ORDER];
let isLoadedFromStorage = false;

const persistOrders = async () => {
  try {
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(localOrders));
  } catch (e) {}
};

const ensureOrdersLoaded = async () => {
  if (isLoadedFromStorage) return;
  try {
    const saved = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localOrders = parsed;
      }
    }
  } catch (e) {}
  isLoadedFromStorage = true;
};

// Check if an order's status is Cancelled or Rejected (case-insensitive)
export const isCancelledOrRejected = (status?: string | OrderStatus): boolean => {
  if (!status) return false;
  const s = status.toString().trim().toLowerCase();
  return s === 'cancelled' || s === 'rejected';
};

// Check if a date string falls on the current local calendar date
export const isOrderFromToday = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  try {
    const orderDate = new Date(dateStr);
    const today = new Date();
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  } catch (e) {
    return false;
  }
};

export const orderService = {
  // Create a new order (Customer action)
  createOrder: async (
    customerId: string,
    customerName: string,
    customerPhone: string,
    items: OrderItem[],
    subtotal: number,
    deliveryCharge: number,
    total: number,
    address: Address,
    paymentMethod: 'COD' | 'PICKUP' | 'ONLINE'
  ): Promise<Order> => {
    await ensureOrdersLoaded();
    const now = new Date().toISOString();
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      id: orderId,
      customerId,
      customerName,
      customerPhone,
      items,
      subtotal,
      deliveryCharge,
      total,
      address,
      paymentMethod,
      status: 'Pending',
      statusHistory: [{ status: 'Pending', timestamp: now }],
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      safeFirestoreWrite(() => setDoc(doc(db, 'orders', orderId), newOrder));
    }

    localOrders.unshift(newOrder);
    await persistOrders();

    // Deduct purchased quantities from product stock automatically
    for (const item of items) {
      const prod = await productService.getProductById(item.productId);
      if (prod) {
        const remainingStock = Math.max(0, prod.stock - item.quantity);
        await productService.updateStock(prod.id, remainingStock);
      }
    }

    return newOrder;
  },

  // Get orders for a specific customer
  getCustomerOrders: async (customerId: string): Promise<Order[]> => {
    await ensureOrdersLoaded();
    return localOrders.filter(o => o.customerId === customerId || customerId === 'guest');
  },

  // Get single order details
  getOrderById: async (orderId: string): Promise<Order | null> => {
    await ensureOrdersLoaded();
    const found = localOrders.find(o => o.id === orderId);
    return found || null;
  },

  // Get all orders (Vendor dashboard view)
  getAllOrders: async (): Promise<Order[]> => {
    await ensureOrdersLoaded();
    return localOrders;
  },

  // Update order status (Vendor action)
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order | null> => {
    await ensureOrdersLoaded();
    const now = new Date().toISOString();

    const order = localOrders.find(o => o.id === orderId);
    if (!order) return null;

    // Restore stock if cancelling or rejecting (only if not already cancelled/rejected)
    if (isCancelledOrRejected(newStatus) && !isCancelledOrRejected(order.status)) {
      for (const item of order.items) {
        const prod = await productService.getProductById(item.productId);
        if (prod) {
          await productService.updateStock(prod.id, prod.stock + item.quantity);
        }
      }
    }

    const history = order.statusHistory || [];
    const updatedHistory = [...history, { status: newStatus, timestamp: now }];

    const patch = {
      status: newStatus,
      statusHistory: updatedHistory,
      updatedAt: now,
    };

    if (db) {
      safeFirestoreWrite(() => updateDoc(doc(db, 'orders', orderId), patch));
    }

    order.status = newStatus;
    order.statusHistory = updatedHistory;
    order.updatedAt = now;

    await persistOrders();
    return order;
  },

  // Accept Order
  acceptOrder: async (orderId: string): Promise<Order | null> => {
    return orderService.updateOrderStatus(orderId, 'Accepted');
  },

  // Reject Order
  rejectOrder: async (orderId: string): Promise<Order | null> => {
    return orderService.updateOrderStatus(orderId, 'Rejected');
  },

  // Update Delivery Charge for a specific order (Vendor action)
  updateOrderDeliveryCharge: async (orderId: string, newDeliveryCharge: number): Promise<Order | null> => {
    await ensureOrdersLoaded();
    const order = localOrders.find(o => o.id === orderId);
    if (!order) return null;

    const charge = Math.max(0, Math.round(newDeliveryCharge));
    order.deliveryCharge = charge;
    order.total = order.subtotal + charge;
    order.updatedAt = new Date().toISOString();

    const patch = {
      deliveryCharge: charge,
      total: order.total,
      updatedAt: order.updatedAt,
    };

    if (db) {
      safeFirestoreWrite(() => updateDoc(doc(db, 'orders', orderId), patch));
    }

    await persistOrders();
    return order;
  },

  // Calculate vendor dashboard metrics
  getVendorMetrics: async () => {
    await ensureOrdersLoaded();
    const orders = await orderService.getAllOrders();

    // Today's orders in the shop's local timezone
    const todayOrders = orders.filter(o => isOrderFromToday(o.createdAt));

    // Active pending queue (excluding any cancelled or rejected orders)
    const pending = orders.filter(
      o => !isCancelledOrRejected(o.status) && (o.status === 'Pending' || o.status === 'Accepted' || o.status === 'Preparing')
    );

    // Completed deliveries
    const completed = orders.filter(o => o.status === 'Delivered');

    // All cancelled and rejected orders in system
    const allCancelled = orders.filter(o => isCancelledOrRejected(o.status));

    // Cancelled and rejected orders specifically from today
    const cancelledOrdersToday = todayOrders.filter(o => isCancelledOrRejected(o.status));
    const cancelledAmountToday = cancelledOrdersToday.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // =========================================================================
    // TODAY'S SALES CALCULATION:
    // IMPORTANT: CANCELLED OR REJECTED ORDERS MUST NOT BE ADDED TO TODAY'S SALES!
    // They are strictly excluded.
    // =========================================================================
    const validOrdersToday = todayOrders.filter(o => !isCancelledOrRejected(o.status));
    const todaySales = validOrdersToday.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      todayCount: validOrdersToday.length,
      allTodayCount: todayOrders.length,
      pendingCount: pending.length,
      completedCount: completed.length,
      cancelledCount: allCancelled.length,
      todaySales,
      cancelledAmountToday,
      cancelledCountToday: cancelledOrdersToday.length,
    };
  },
};
