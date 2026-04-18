import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme/tokens';
import { useAccent } from '../context/ThemeContext';

export type Frequency = 'daily' | 'weekdays' | 'custom';

const OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'custom', label: 'Custom' },
];

interface FrequencyPillsProps {
  selected: Frequency;
  onSelect: (value: Frequency) => void;
}

export default function FrequencyPills({ selected, onSelect }: FrequencyPillsProps) {
  const { accent } = useAccent();

  return (
    <View style={styles.row}>
      {OPTIONS.map(({ value, label }) => {
        const isActive = selected === value;
        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value)}
            style={[
              styles.pill,
              isActive && { backgroundColor: accent.dim, borderColor: accent.border },
            ]}
          >
            <Text style={[styles.label, isActive && { color: accent.hex }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
});
