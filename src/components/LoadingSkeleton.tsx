import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 6,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
    marginVertical: 4,
  },
});
