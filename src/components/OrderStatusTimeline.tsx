import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus } from '../types';
import { COLORS, SPACING } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

const STAGES: { status: OrderStatus; icon: any; translationKey: any }[] = [
  { status: 'Pending', icon: 'time-outline', translationKey: 'statusPending' },
  { status: 'Accepted', icon: 'checkmark-circle-outline', translationKey: 'statusAccepted' },
  { status: 'Preparing', icon: 'restaurant-outline', translationKey: 'statusPreparing' },
  { status: 'Ready', icon: 'cube-outline', translationKey: 'statusReady' },
  { status: 'Out for Delivery', icon: 'bicycle-outline', translationKey: 'statusOutForDelivery' },
  { status: 'Delivered', icon: 'home-outline', translationKey: 'statusDelivered' },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ currentStatus }) => {
  const { t } = useLanguage();

  if (currentStatus === 'Cancelled' || currentStatus === 'Rejected') {
    return (
      <View style={styles.cancelledCard}>
        <Ionicons name="close-circle" size={32} color={COLORS.danger} />
        <Text style={styles.cancelledText}>
          {currentStatus === 'Rejected' ? 'Order Rejected by Store' : t('statusCancelled')}
        </Text>
      </View>
    );
  }

  const currentIdx = STAGES.findIndex(s => s.status === currentStatus);

  return (
    <View style={styles.container}>
      {STAGES.map((stage, idx) => {
        const isPassed = idx <= currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <View key={stage.status} style={styles.stageRow}>
            {/* Left Icon & Line */}
            <View style={styles.timelineCol}>
              <View
                style={[
                  styles.dot,
                  isPassed && styles.dotPassed,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                <Ionicons
                  name={stage.icon}
                  size={14}
                  color={isPassed ? COLORS.surface : COLORS.textMuted}
                />
              </View>

              {idx < STAGES.length - 1 && (
                <View
                  style={[
                    styles.line,
                    idx < currentIdx && styles.linePassed,
                  ]}
                />
              )}
            </View>

            {/* Stage Info */}
            <View style={styles.contentCol}>
              <Text
                style={[
                  styles.stageTitle,
                  isPassed && styles.stageTitlePassed,
                  isCurrent && styles.stageTitleCurrent,
                ]}
              >
                {t(stage.translationKey)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelledCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelledText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineCol: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 24,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dotPassed: {
    backgroundColor: COLORS.success,
  },
  dotCurrent: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.15 }],
  },
  line: {
    width: 2,
    height: 32,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  linePassed: {
    backgroundColor: COLORS.success,
  },
  contentCol: {
    flex: 1,
    paddingTop: 2,
    height: 48,
  },
  stageTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  stageTitlePassed: {
    color: COLORS.text,
    fontWeight: '600',
  },
  stageTitleCurrent: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
