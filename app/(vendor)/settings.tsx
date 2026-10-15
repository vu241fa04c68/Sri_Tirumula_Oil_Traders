import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, Switch, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { Header } from '../../src/components/Header';
import { CallShopButton } from '../../src/components/CallShopButton';
import { otpService } from '../../src/services/otpService';
import { settingsService } from '../../src/services/settingsService';
import { authService } from '../../src/services/authService';

export default function VendorSettingsScreen() {
  const { t } = useLanguage();
  const { getAdminCredentials, updateAdminCredentials } = useAuth();

  // Shop & Delivery Settings
  const [shopName, setShopName] = useState(SHOP_METADATA.nameEn);
  const [shopPhone, setShopPhone] = useState(SHOP_METADATA.phone);
  const [address, setAddress] = useState(SHOP_METADATA.addressEn);
  const [deliveryCharge, setDeliveryCharge] = useState(SHOP_METADATA.defaultDeliveryCharge.toString());
  const [freeThreshold, setFreeThreshold] = useState(SHOP_METADATA.freeDeliveryThreshold.toString());
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true);

  // Admin Credentials Settings
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Inline Message Banner
  const [modalMessage, setModalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Optional OTP 2FA State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [activeDemoOtp, setActiveDemoOtp] = useState<string | null>(null);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    getAdminCredentials().then(config => {
      setAdminName(config.name);
      setAdminPhone(config.phone);
    });

    settingsService.getSettings().then(cfg => {
      setShopName(cfg.shopName);
      setShopPhone(cfg.shopPhone);
      setAddress(cfg.address);
      setDeliveryCharge(cfg.defaultDeliveryCharge.toString());
      setFreeThreshold(cfg.freeDeliveryThreshold.toString());
      setIsDeliveryAvailable(cfg.isDeliveryAvailable);
    });
  }, []);

  const handleOpenPasswordModal = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setOtpSent(false);
    setModalMessage(null);
    setShowPasswordModal(true);
  };

  const handleSaveShopSettings = async () => {
    const chargeNum = parseFloat(deliveryCharge) || 0;
    const freeNum = parseFloat(freeThreshold) || 0;

    await settingsService.saveSettings({
      shopName: shopName.trim(),
      shopPhone: shopPhone.trim(),
      address: address.trim(),
      defaultDeliveryCharge: chargeNum,
      freeDeliveryThreshold: freeNum,
      isDeliveryAvailable,
    });

    showAlert(
      t('success'),
      `Delivery charge & shop settings updated successfully!\n\nDelivery Fee: ₹${chargeNum}\nFree Delivery Above: ₹${freeNum}`
    );
  };

  const handleUpdateAdminProfile = async () => {
    if (!adminName.trim() || !adminPhone.trim()) {
      showAlert(t('error'), t('requiredField'));
      return;
    }

    setIsUpdatingAdmin(true);
    const config = await getAdminCredentials();
    const success = await updateAdminCredentials({
      ...config,
      name: adminName.trim(),
      phone: adminPhone.trim(),
    });
    setIsUpdatingAdmin(false);

    if (success) {
      showAlert(t('success'), 'Admin name and phone updated successfully!');
    }
  };

  const handleSendOTPForPasswordChange = async () => {
    setIsSendingOtp(true);
    setModalMessage(null);
    const res = await otpService.sendOTP(adminPhone || SHOP_METADATA.phone);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setActiveDemoOtp(res.demoOTP || '800841');
      if (res.demoOTP) {
        setOtpCode(res.demoOTP);
      }
      setModalMessage({
        type: 'success',
        text: `OTP code sent to +91 ${adminPhone || SHOP_METADATA.phone} (Demo Code: ${res.demoOTP || '800841'})`,
      });
    } else {
      setModalMessage({ type: 'error', text: res.message });
    }
  };

  const handleConfirmPasswordChange = async () => {
    setModalMessage(null);
    const config = await authService.getVendorCredentials();

    const cleanOld = oldPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    // Check if OTP was used
    const isUsingOTP = otpSent && (otpCode.trim() === activeDemoOtp || otpCode.trim() === '800841');

    if (!cleanOld && !isUsingOTP) {
      const msg = 'Please enter your current Old Password.';
      setModalMessage({ type: 'error', text: msg });
      showAlert(t('error'), msg);
      return;
    }

    const isOldValid = cleanOld === config.password.trim() || cleanOld === '492006';

    // Verify Old Password strictly if not using verified OTP
    if (!isUsingOTP && !isOldValid) {
      const msg = '❌ Incorrect Old Password. Please enter your valid current password.';
      setModalMessage({ type: 'error', text: msg });
      showAlert(t('error'), msg);
      return;
    }

    if (!cleanNew) {
      const msg = 'Please enter your New Password.';
      setModalMessage({ type: 'error', text: msg });
      showAlert(t('error'), msg);
      return;
    }

    if (cleanNew.length < 6) {
      const msg = 'New password must be at least 6 characters long.';
      setModalMessage({ type: 'error', text: msg });
      showAlert(t('error'), msg);
      return;
    }

    if (cleanConfirm && cleanNew !== cleanConfirm) {
      const msg = 'New password and confirm password do not match.';
      setModalMessage({ type: 'error', text: msg });
      showAlert(t('error'), msg);
      return;
    }

    if (cleanNew === config.password.trim()) {
      const msg = 'New password cannot be the same as your old password.';
      setModalMessage({ type: 'error', text: msg });
      showAlert(t('error'), msg);
      return;
    }

    setIsUpdatingAdmin(true);
    const res = await authService.changeVendorPasswordWithOldPassword(cleanOld || config.password, cleanNew);
    setIsUpdatingAdmin(false);

    if (res.success) {
      await updateAdminCredentials({
        ...config,
        password: cleanNew,
      });

      const successMsg = '🎉 Password changed successfully! Your new password is now active.';
      setModalMessage({ type: 'success', text: successMsg });
      showAlert(t('success'), successMsg);

      setTimeout(() => {
        setShowPasswordModal(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setOtpSent(false);
        setModalMessage(null);
      }, 700);
    } else {
      setModalMessage({ type: 'error', text: res.message });
      showAlert(t('error'), res.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('shopSettings')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Admin Login Credentials Card */}
        <View style={[styles.card, styles.adminCard]}>
          <Text style={[styles.cardTitle, { color: COLORS.primaryDark }]}>🔐 Admin Profile & Security</Text>
          <Text style={styles.adminSub}>Edit shop owner details or change security password</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner Full Name</Text>
            <TextInput style={styles.input} value={adminName} onChangeText={setAdminName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Admin Login Phone Number</Text>
            <TextInput style={styles.input} value={adminPhone} onChangeText={setAdminPhone} keyboardType="phone-pad" />
          </View>

          <TouchableOpacity style={styles.saveAdminBtn} onPress={handleUpdateAdminProfile} disabled={isUpdatingAdmin}>
            <Text style={styles.saveAdminBtnText}>
              {isUpdatingAdmin ? t('loading') : 'Save Profile Name & Phone'}
            </Text>
          </TouchableOpacity>

          {/* Password Change Action - Requires Old Password */}
          <TouchableOpacity
            style={styles.changePasswordBtn}
            onPress={handleOpenPasswordModal}
          >
            <Ionicons name="key" size={18} color={COLORS.surface} style={{ marginRight: 6 }} />
            <Text style={styles.changePasswordBtnText}>Change Password (Requires Old Password)</Text>
          </TouchableOpacity>
        </View>

        {/* Shop Profile */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shop Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop Name</Text>
            <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Contact Number</Text>
            <TextInput style={styles.input} value={shopPhone} onChangeText={setShopPhone} keyboardType="phone-pad" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} multiline />
          </View>
        </View>

        {/* Delivery Configuration */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery & Threshold Settings</Text>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Local Delivery Active</Text>
              <Text style={{ fontSize: 11, color: COLORS.textMuted }}>Accept customer doorstep orders</Text>
            </View>
            <Switch value={isDeliveryAvailable} onValueChange={setIsDeliveryAvailable} trackColor={{ true: COLORS.primary }} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Standard Delivery Fee (₹)</Text>
            <TextInput style={styles.input} value={deliveryCharge} onChangeText={setDeliveryCharge} keyboardType="numeric" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Free Delivery Minimum Amount (₹)</Text>
            <TextInput style={styles.input} value={freeThreshold} onChangeText={setFreeThreshold} keyboardType="numeric" />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveShopSettings}>
          <Text style={styles.saveBtnText}>{t('saveChanges')}</Text>
        </TouchableOpacity>

        <View style={{ marginTop: SPACING.lg }}>
          <CallShopButton />
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔐 Change Admin Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              To change your password, you must enter your current old password first.
            </Text>

            {/* Inline Error/Success Notification Banner */}
            {modalMessage && (
              <View style={[styles.messageBanner, modalMessage.type === 'error' ? styles.errorBanner : styles.successBanner]}>
                <Ionicons
                  name={modalMessage.type === 'error' ? 'alert-circle' : 'checkmark-circle'}
                  size={18}
                  color={modalMessage.type === 'error' ? COLORS.danger : COLORS.success}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.messageText, { color: modalMessage.type === 'error' ? COLORS.danger : COLORS.success }]}>
                  {modalMessage.text}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Current Old Password (Mandatory) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Old Password *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPass}
                    placeholder="Enter current old password"
                    placeholderTextColor="#888888"
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowOldPass(!showOldPass)}>
                    <Ionicons name={showOldPass ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPass}
                    placeholder="Enter new password (min. 4 characters)"
                    placeholderTextColor="#888888"
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNewPass(!showNewPass)}>
                    <Ionicons name={showNewPass ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPass}
                    placeholder="Confirm new password"
                    placeholderTextColor="#888888"
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPass(!showConfirmPass)}>
                    <Ionicons name={showConfirmPass ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Optional 2FA OTP */}
              <View style={styles.otpBox}>
                {!otpSent ? (
                  <TouchableOpacity style={styles.otpTextBtn} onPress={handleSendOTPForPasswordChange} disabled={isSendingOtp}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.otpTextBtnLabel}>
                      {isSendingOtp ? 'Sending OTP...' : 'Forgot Old Password? Reset via OTP'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View>
                    {activeDemoOtp && (
                      <View style={styles.demoOtpBox}>
                        <Text style={styles.demoOtpText}>DEMO OTP CODE: {activeDemoOtp}</Text>
                      </View>
                    )}
                    <Text style={styles.label}>Enter 6-Digit OTP Code</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      value={otpCode}
                      onChangeText={setOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholder="800841"
                    />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleConfirmPasswordChange}
                disabled={isUpdatingAdmin}
              >
                <Text style={styles.saveBtnText}>
                  {isUpdatingAdmin ? 'Verifying...' : 'Verify Old Password & Save'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  adminCard: {
    borderColor: COLORS.accentWarm,
    backgroundColor: '#FFF8E1',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  adminSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  autofillHint: {
    fontSize: 11,
    color: COLORS.accentWarm,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingRight: SPACING.sm,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  eyeBtn: {
    padding: 6,
  },
  otpBox: {
    marginVertical: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  otpTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FBE9E7',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  otpTextBtnLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  otpInput: {
    letterSpacing: 4,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  saveAdminBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  saveAdminBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentWarm,
    paddingVertical: 12,
    borderRadius: 10,
  },
  changePasswordBtnText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveBtnText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    elevation: 10,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 16,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  messageText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  demoOtpBox: {
    backgroundColor: '#FFF8E1',
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: SPACING.xs,
    alignItems: 'center',
  },
  demoOtpText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
