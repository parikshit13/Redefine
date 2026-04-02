import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';

interface GoalStepperProps {
  timesPerDay: number;
  duration: number;
  onTimesChange: (v: number) => void;
  onDurationChange: (v: number) => void;
}

function StepperRow({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.controls}>
        <Pressable onPress={onDecrement} style={styles.stepperButton}>
          <Text style={styles.stepperButtonText}>−</Text>
        </Pressable>
        <Text style={styles.stepperValue}>{value}</Text>
        <Pressable onPress={onIncrement} style={styles.stepperButton}>
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function GoalStepper({
  timesPerDay,
  duration,
  onTimesChange,
  onDurationChange,
}: GoalStepperProps) {
  return (
    <GlassCard style={styles.card}>
      <StepperRow
        label="Times per day"
        value={timesPerDay}
        onDecrement={() => onTimesChange(Math.max(1, timesPerDay - 1))}
        onIncrement={() => onTimesChange(timesPerDay + 1)}
      />
      <View style={styles.divider} />
      <StepperRow
        label="Duration (min)"
        value={duration}
        onDecrement={() => onDurationChange(Math.max(5, duration - 5))}
        onIncrement={() => onDurationChange(duration + 5)}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  stepperLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: -1,
  },
  stepperValue: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: 8,
  },
});
