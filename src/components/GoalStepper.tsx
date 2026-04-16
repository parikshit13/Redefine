import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';

interface GoalStepperProps {
  timesPerDay: number;
  duration: number;
  onTimesChange: (v: number) => void;
  onDurationChange: (v: number) => void;
  onEditFocus?: () => void;
}

function StepperRow({
  label,
  value,
  min,
  onDecrement,
  onIncrement,
  onCommit,
  onEditFocus,
}: {
  label: string;
  value: number;
  min: number;
  onDecrement: () => void;
  onIncrement: () => void;
  onCommit: (v: number) => void;
  onEditFocus?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const startEditing = () => {
    setDraft(String(value));
    setEditing(true);
    onEditFocus?.();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const finishEditing = () => {
    const parsed = parseInt(draft, 10);
    const next = Number.isFinite(parsed) ? Math.max(min, parsed) : value;
    onCommit(next);
    setDraft(String(next));
    setEditing(false);
  };

  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.controls}>
        <Pressable onPress={onDecrement} style={styles.stepperButton}>
          <Text style={styles.stepperButtonText}>−</Text>
        </Pressable>
        {editing ? (
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onFocus={onEditFocus}
            onBlur={finishEditing}
            onSubmitEditing={finishEditing}
            keyboardType="number-pad"
            returnKeyType="done"
            selectionColor={colors.sage}
            style={styles.stepperInput}
          />
        ) : (
          <Pressable onPress={startEditing} hitSlop={6}>
            <Text style={styles.stepperValue}>{value}</Text>
          </Pressable>
        )}
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
  onEditFocus,
}: GoalStepperProps) {
  return (
    <GlassCard style={styles.card}>
      <StepperRow
        label="Times per day"
        value={timesPerDay}
        min={1}
        onDecrement={() => onTimesChange(Math.max(1, timesPerDay - 1))}
        onIncrement={() => onTimesChange(timesPerDay + 1)}
        onCommit={onTimesChange}
        onEditFocus={onEditFocus}
      />
      <View style={styles.divider} />
      <StepperRow
        label="Duration (min)"
        value={duration}
        min={0}
        onDecrement={() => onDurationChange(Math.max(0, duration - 5))}
        onIncrement={() => onDurationChange(duration + 5)}
        onCommit={onDurationChange}
        onEditFocus={onEditFocus}
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
  stepperInput: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: colors.textPrimary,
    minWidth: 36,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: 8,
  },
});
