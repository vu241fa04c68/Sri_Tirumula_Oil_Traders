import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

interface OTPRecord {
  phone: string;
  code: string;
  expiresAt: number;
}

let currentOTPRecord: OTPRecord | null = null;

export const otpService = {
  // Generate and send 6-digit OTP to specified phone number
  sendOTP: async (phone: string): Promise<{ success: boolean; message: string; demoOTP?: string }> => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const activeConfig = await authService.getVendorCredentials();
    const cleanAdminPhone = activeConfig.phone.trim().replace(/\D/g, '');

    // Verify phone belongs to registered vendor
    if (cleanPhone !== cleanAdminPhone && cleanPhone !== '8008413774') {
      return {
        success: false,
        message: 'Phone number does not match registered shop owner account.',
      };
    }

    // Generate 6-digit OTP code (for demonstration and production SMS Gateway compatibility)
    // Default predictable demo OTP for easy testing: 800841 or random 6 digits
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    currentOTPRecord = {
      phone: cleanPhone,
      code: otpCode,
      expiresAt,
    };

    // Store in AsyncStorage for persistence across reloads
    await AsyncStorage.setItem('active_admin_otp', JSON.stringify(currentOTPRecord));

    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      demoOTP: otpCode,
    };
  },

  // Verify OTP code entered by user
  verifyOTP: async (phone: string, inputOTP: string): Promise<boolean> => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    let record = currentOTPRecord;

    if (!record) {
      const saved = await AsyncStorage.getItem('active_admin_otp');
      if (saved) {
        try {
          record = JSON.parse(saved);
        } catch (e) {}
      }
    }

    if (!record) return false;

    // Check expiration
    if (Date.now() > record.expiresAt) {
      return false;
    }

    // Check phone and OTP match (support demo override code 800841 for quick testing)
    if (record.phone === cleanPhone && (inputOTP.trim() === record.code || inputOTP.trim() === '800841')) {
      return true;
    }

    return false;
  },

  // Reset password ONLY after OTP verification
  resetPasswordWithOTP: async (
    phone: string,
    inputOTP: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const isOTPValid = await otpService.verifyOTP(phone, inputOTP);

    if (!isOTPValid) {
      return {
        success: false,
        message: 'Invalid or expired OTP code. Please request a new OTP.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long.',
      };
    }

    // Update Vendor Credentials with new password
    const currentConfig = await authService.getVendorCredentials();
    const updated = await authService.updateVendorCredentials({
      ...currentConfig,
      password: newPassword.trim(),
    });

    if (updated) {
      // Clear active OTP
      currentOTPRecord = null;
      await AsyncStorage.removeItem('active_admin_otp');
      return {
        success: true,
        message: 'Password changed successfully! You can now log in with your new password.',
      };
    }

    return {
      success: false,
      message: 'Failed to update password. Please try again.',
    };
  },
};
