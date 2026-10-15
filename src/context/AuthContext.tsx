import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserRole, Address } from '../types';
import { authService, VendorAdminConfig } from '../services/authService';

export interface CustomerSavedInfo {
  name: string;
  phone: string;
  addresses: Address[];
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  loginCustomer: (phone: string, name?: string) => Promise<void>;
  loginVendor: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  updateAdminCredentials: (config: VendorAdminConfig) => Promise<boolean>;
  getAdminCredentials: () => Promise<VendorAdminConfig>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  savedCustomerInfo: CustomerSavedInfo;
  updateSavedCustomerInfo: (info: Partial<CustomerSavedInfo>) => Promise<void>;
  updateUserAddresses: (address: Address) => Promise<void>;
  updateUserProfile: (name: string, phone: string) => Promise<void>;
}

const CUSTOMER_DELIVERY_KEY = '@customer_saved_delivery_info';

const AuthContext = createContext<AuthContextType>({
  user: null, // Customers do not have login; only vendor logs in
  role: 'customer',
  isLoading: false,
  loginCustomer: async () => {},
  loginVendor: async () => ({ success: false }),
  updateAdminCredentials: async () => false,
  getAdminCredentials: async () => ({ phone: '8008413774', password: 'admin8008413774', name: 'Owner' }),
  logout: async () => {},
  switchRole: () => {},
  savedCustomerInfo: { name: '', phone: '', addresses: [] },
  updateSavedCustomerInfo: async () => {},
  updateUserAddresses: async () => {},
  updateUserProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only vendor has login; customer is guest by default with user = null
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedCustomerInfo, setSavedCustomerInfo] = useState<CustomerSavedInfo>({
    name: '',
    phone: '',
    addresses: [],
  });

  useEffect(() => {
    // 1. Check for active vendor login session
    AsyncStorage.getItem('auth_user').then(saved => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.role === 'vendor') {
            setUser(parsed);
            setRole('vendor');
          } else {
            // Customer app has NO user login. Clear legacy customer session.
            setUser(null);
            setRole('customer');
            AsyncStorage.removeItem('auth_user');
          }
        } catch (e) {
          setUser(null);
          setRole('customer');
        }
      } else {
        setUser(null);
        setRole('customer');
      }
      setIsLoading(false);
    });

    // 2. Load optional device-saved customer delivery details (for checkout speed)
    AsyncStorage.getItem(CUSTOMER_DELIVERY_KEY).then(saved => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name === 'K. Ramarao') parsed.name = '';
          if (parsed.phone === '9848022338') parsed.phone = '';
          setSavedCustomerInfo(parsed);
        } catch (e) {}
      }
    });
  }, []);

  // Vendor Login (ONLY the vendor has login)
  const loginVendor = async (phone: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const res = await authService.loginVendor(phone, password);
    if (res.success && res.profile) {
      setUser(res.profile);
      setRole('vendor');
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.profile));
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, message: res.message };
  };

  // Vendor Logout
  const logout = async () => {
    setUser(null);
    setRole('customer');
    await AsyncStorage.removeItem('auth_user');
  };

  // Deprecated customer login shim (user app has no login)
  const loginCustomer = async () => {};

  const updateAdminCredentials = async (config: VendorAdminConfig): Promise<boolean> => {
    const success = await authService.updateVendorCredentials(config);
    if (success && user && role === 'vendor') {
      const updatedProfile: UserProfile = {
        ...user,
        name: config.name,
        phone: config.phone,
      };
      setUser(updatedProfile);
      await AsyncStorage.setItem('auth_user', JSON.stringify(updatedProfile));
    }
    return success;
  };

  const getAdminCredentials = async (): Promise<VendorAdminConfig> => {
    return authService.getVendorCredentials();
  };

  const switchRole = (newRole: UserRole) => {
    if (newRole === 'vendor') {
      if (user?.role !== 'vendor') {
        return;
      }
      setRole('vendor');
    } else {
      setRole('customer');
    }
  };

  const updateSavedCustomerInfo = async (info: Partial<CustomerSavedInfo>) => {
    const updated: CustomerSavedInfo = {
      ...savedCustomerInfo,
      ...info,
    };
    setSavedCustomerInfo(updated);
    await AsyncStorage.setItem(CUSTOMER_DELIVERY_KEY, JSON.stringify(updated));
  };

  const updateUserAddresses = async (addressData: Address) => {
    const updatedList = [...(savedCustomerInfo.addresses || []), addressData];
    await updateSavedCustomerInfo({ addresses: updatedList });
  };

  const updateUserProfile = async (name: string, phone: string) => {
    await updateSavedCustomerInfo({ name, phone });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        loginCustomer,
        loginVendor,
        updateAdminCredentials,
        getAdminCredentials,
        logout,
        switchRole,
        savedCustomerInfo,
        updateSavedCustomerInfo,
        updateUserAddresses,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
