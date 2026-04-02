import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface DayPickerProps {
  selected: boolean[];  // length 7, index 0=Mon
  onToggle: (index: number) => void;
}

export default function DayPicker({ selected, onToggle }: DayPickerProps) {
  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, i) => {
        const isActive = selected[i];
        return (
          <Pressable
            key={i}
            onPress={() => onToggle(i)}
            style={[styles.circle, isActive && styles.circleActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
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
    justifyContent: 'space-between',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: 'rgba(139,175,139,0.15)',
    borderColor: 'rgba(139,175,139,0.25)',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.sage,
  },
});
