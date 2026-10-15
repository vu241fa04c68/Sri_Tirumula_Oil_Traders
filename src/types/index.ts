export type UserRole = 'customer' | 'vendor' | 'guest';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  createdAt: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  title: string; // e.g., 'Home', 'Work'
  fullAddress: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  nameEn: string;
  nameTe: string;
  icon: string;
  image?: string;
  descriptionEn?: string;
  descriptionTe?: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameTe: string;
  descriptionEn: string;
  descriptionTe: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  unit: string; // e.g. '1 kg', '1 L', '500 g', 'Packet'
  image: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Rejected';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  nameEn: string;
  nameTe: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  address: Address;
  paymentMethod: 'COD' | 'PICKUP' | 'ONLINE';
  status: OrderStatus;
  statusHistory?: { status: OrderStatus; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  shopNameEn: string;
  shopNameTe: string;
  phone: string;
  alternatePhone?: string;
  addressEn: string;
  addressTe: string;
  businessHoursEn: string;
  businessHoursTe: string;
  isDeliveryAvailable: boolean;
  minOrderAmount: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}

export type Language = 'en' | 'te';
