import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../constants/theme';
import { IMAGE_PRESETS, autoSelectProductImage } from '../utils/imageMatcher';

interface ImagePickerWidgetProps {
  currentImage: string;
  onImageChange: (newUrl: string) => void;
  productName?: string;
  language?: 'en' | 'te';
}

export const ImagePickerWidget: React.FC<ImagePickerWidgetProps> = ({
  currentImage,
  onImageChange,
  productName = '',
  language = 'en',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle web file selection from local device / gallery
  const handleFileChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (e.target?.result) {
          onImageChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileBrowser = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAutoMatch = () => {
    const autoUrl = autoSelectProductImage(productName);
    onImageChange(autoUrl);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Product Photo (Upload Custom or Auto-Match)</Text>

      {/* Hidden Web File Input */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef as any}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      )}

      {/* Live Image Preview Card */}
      <View style={styles.previewBox}>
        <Image
          source={{ uri: currentImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80' }}
          style={styles.previewImage}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.uploadOverlayBtn} onPress={triggerFileBrowser}>
          <Ionicons name="camera" size={20} color={COLORS.surface} style={{ marginRight: 6 }} />
          <Text style={styles.uploadOverlayBtnText}>Upload Photo from Device</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.uploadBtn} onPress={triggerFileBrowser}>
          <Ionicons name="cloud-upload" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.uploadBtnText}>Upload from Computer / Gallery</Text>
        </TouchableOpacity>

        {productName.length > 0 && (
          <TouchableOpacity style={styles.autoMatchBtn} onPress={handleAutoMatch}>
            <Ionicons name="sparkles" size={16} color={COLORS.accentWarm} style={{ marginRight: 4 }} />
            <Text style={styles.autoMatchBtnText}>Auto-Match Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Manual URL Input */}
      <View style={styles.urlInputRow}>
        <Ionicons name="link" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
        <TextInput
          style={styles.urlInput}
          value={currentImage.startsWith('data:') ? '[Uploaded Custom File]' : currentImage}
          onChangeText={onImageChange}
          placeholder="Or paste custom image web link (URL)..."
        />
      </View>

      {/* Presets Grid */}
      <Text style={styles.presetLabel}>Or Pick from Shop Photo Presets:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
        {IMAGE_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset.id}
            style={[styles.presetCard, currentImage === preset.url && styles.activePresetCard]}
            onPress={() => onImageChange(preset.url)}
          >
            <Image source={{ uri: preset.url }} style={styles.presetImage} />
            <Text style={styles.presetName} numberOfLines={1}>
              {language === 'te' ? preset.nameTe : preset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  previewBox: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.borderLight,
    position: 'relative',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlayBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    elevation: 4,
  },
  uploadOverlayBtnText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  uploadBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  uploadBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  autoMatchBtn: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: COLORS.accentWarm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  autoMatchBtnText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  presetScroll: {
    flexDirection: 'row',
  },
  presetCard: {
    width: 85,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 4,
    marginRight: 8,
    alignItems: 'center',
  },
  activePresetCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5',
  },
  presetImage: {
    width: 65,
    height: 48,
    borderRadius: 6,
  },
  presetName: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
    textAlign: 'center',
  },
});
