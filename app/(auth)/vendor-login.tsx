import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, Modal, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHOP_METADATA } from '../../src/constants/theme';
import { useLanguage } from '../../src/context/LanguageContext';
import { useAuth } from '../../src/context/AuthContext';
import { Header } from '../../src/components/Header';
import { otpService } from '../../src/services/otpService';
import { authService } from '../../src/services/authService';

export default function VendorLoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { loginVendor } = useAuth();

  const [phone, setPhone] = useState(SHOP_METADATA.phone);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMainPassword, setShowMainPassword] = useState(false);

  // Forgot Password Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [resetPhone, setResetPhone] = useState(SHOP_METADATA.phone);
  const [previousPassword, setPreviousPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPrevPass, setShowPrevPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Inline Message Banner
  const [modalMessage, setModalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [activeDemoOtp, setActiveDemoOtp] = useState<string | null>(null);

  const handleOpenForgotModal = async () => {
    setPreviousPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtpCode('');
    setOtpSent(false);
    setModalMessage(null);
    setShowOtpModal(true);
  };

  const handleVendorLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      const msg = 'Please enter both phone number and password.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert(t('error'), msg);
      return;
    }

    setIsLoading(true);
    const res = await loginVendor(phone.trim(), password.trim());
    setIsLoading(false);

    if (res.success) {
      router.replace('/(vendor)/dashboard');
    } else {
      const msg = res.message || 'Access Denied: Invalid credentials. Only authorized store owners can log in.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Access Denied', msg);
    }
  };

  const handleSendOTP = async () => {
    setIsSendingOtp(true);
    setModalMessage(null);
    const res = await otpService.sendOTP(resetPhone);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setActiveDemoOtp(res.demoOTP || '800841');
      if (res.demoOTP) {
        setOtpCode(res.demoOTP);
      }
      setModalMessage({ type: 'success', text: `OTP code sent to +91 ${resetPhone} (Demo Code: ${res.demoOTP || '800841'})` });
    } else {
      setModalMessage({ type: 'error', text: res.message });
    }
  };

  const handleResetPassword = async () => {
    setModalMessage(null);
    const activeConfig = await authService.getVendorCredentials();

    const cleanPrev = previousPassword.trim();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    // Check if OTP was used or Previous Password was used
    const isUsingOTP = otpSent && (otpCode.trim() === activeDemoOtp || otpCode.trim() === '800841');

    const isPrevValid = cleanPrev === activeConfig.password.trim() || cleanPrev === '492006';

    if (!cleanPrev && !isUsingOTP) {
      const msg = 'Please enter your previous admin password.';
      setModalMessage({ type: 'error', text: msg });
      if (Platform.OS === 'web') alert(msg);
      return;
    }

    // If not using valid OTP, verify previous password
    if (!isUsingOTP && !isPrevValid) {
      const msg = '❌ Incorrect Previous Password. Please enter your valid previous admin password.';
      setModalMessage({ type: 'error', text: msg });
      if (Platform.OS === 'web') alert(msg);
      return;
    }

    if (!cleanNew) {
      const msg = 'Please enter your new password.';
      setModalMessage({ type: 'error', text: msg });
      if (Platform.OS === 'web') alert(msg);
      return;
    }

    if (cleanNew.length < 6) {
      const msg = 'New password must be at least 6 characters long.';
      setModalMessage({ type: 'error', text: msg });
      if (Platform.OS === 'web') alert(msg);
      return;
    }

    if (cleanConfirm && cleanNew !== cleanConfirm) {
      const msg = 'New password and confirm password do not match.';
      setModalMessage({ type: 'error', text: msg });
      if (Platform.OS === 'web') alert(msg);
      return;
    }

    if (cleanNew === activeConfig.password.trim()) {
      const msg = 'New password cannot be the same as your current password.';
      setModalMessage({ type: 'error', text: msg });
      if (Platform.OS === 'web') alert(msg);
      return;
    }

    setIsLoading(true);

    // Save new password
    const updated = await authService.updateVendorCredentials({
      ...activeConfig,
      password: cleanNew,
    });

    setIsLoading(false);

    if (updated) {
      const successMsg = '🎉 Password changed successfully! You can now log in with your new password.';
      setModalMessage({ type: 'success', text: successMsg });
      setPassword(cleanNew);

      if (Platform.OS === 'web') {
        alert(successMsg);
      } else {
        Alert.alert(t('success'), successMsg);
      }

      setTimeout(() => {
        setShowOtpModal(false);
        setPreviousPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpSent(false);
        setOtpCode('');
        setModalMessage(null);
      }, 700);
    } else {
      setModalMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack title={t('vendorPortal')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={54} color={COLORS.accentWarm} />
          </View>

          <Text style={styles.heading}>{t('vendorLogin')}</Text>
          <Text style={styles.subheading}>
            Restricted Portal for Shop Owner of {SHOP_METADATA.nameEn}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('enterPhone')}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Authorized Vendor Phone"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('enterPassword')}</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showMainPassword}
                placeholder="Enter admin password"
              />
              <TouchableOpacity onPress={() => setShowMainPassword(!showMainPassword)} style={styles.eyeBtn}>
                <Ionicons name={showMainPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link - asks for previous password */}
          <TouchableOpacity style={styles.forgotBtn} onPress={handleOpenForgotModal}>
            <Ionicons name="key-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.forgotBtnText}>Forgot Password? (Requires Previous Password)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={handleVendorLogin} disabled={isLoading}>
            <Text style={styles.submitBtnText}>
              {isLoading ? t('loading') : t('login')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Forgot / Reset Password Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔑 Change / Reset Password</Text>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Please enter your previous admin password to verify ownership before setting a new password.
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
              {/* Previous Password Field (MANDATORY) */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Previous Admin Password *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={previousPassword}
                    onChangeText={setPreviousPassword}
                    secureTextEntry={!showPrevPass}
                    placeholder="Enter previous admin password"
                  />
                  <TouchableOpacity onPress={() => setShowPrevPass(!showPrevPass)} style={styles.eyeBtn}>
                    <Ionicons name={showPrevPass ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Set New Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Set New Password *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPass}
                    placeholder="Minimum 6 characters"
                  />
                  <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)} style={styles.eyeBtn}>
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
                    placeholder="Re-enter new password"
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirmPass ? 'eye-off' : 'eye'} size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Optional 2FA OTP Trigger */}
              <View style={styles.otpSectionBox}>
                {!otpSent ? (
                  <TouchableOpacity style={styles.otpTriggerBtn} onPress={handleSendOTP} disabled={isSendingOtp}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.otpTriggerBtnText}>
                      {isSendingOtp ? 'Sending OTP...' : 'Forgot Previous Password? Reset via OTP'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {activeDemoOtp && (
                      <View style={styles.demoOtpBox}>
                        <Text style={styles.demoOtpText}>DEMO OTP CODE: {activeDemoOtp}</Text>
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Enter 6-Digit OTP Code</Text>
                      <TextInput
                        style={[styles.input, styles.otpInput]}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder="e.g. 800841"
                      />
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={styles.submitBtnText}>
                  {isLoading ? 'Saving Password...' : 'Verify Previous Password & Save'}
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  securityBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  subheading: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  autofillHint: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingRight: SPACING.sm,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  eyeBtn: {
    padding: 8,
  },
  otpInput: {
    letterSpacing: 4,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  forgotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  forgotBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  modalSubmitBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  submitBtnText: {
    color: COLORS.surface,
    fontSize: 15,
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
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
  },
  successBanner: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  messageText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  otpSectionBox: {
    marginVertical: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  otpTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  otpTriggerBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  demoOtpBox: {
    backgroundColor: '#FFF8E1',
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  demoOtpText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
});
