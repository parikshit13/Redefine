import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';
import { useAccent } from '../context/ThemeContext';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface DayPickerProps {
  selected: boolean[];
  onToggle: (index: number) => void;
}

export default function DayPicker({ selected, onToggle }: DayPickerProps) {
  const { accent } = useAccent();

  return (
    <View style={styles.row}>
      {DAY_LABELS.map((label, i) => {
        const isActive = selected[i];
        return (
          <Pressable
            key={i}
            onPress={() => onToggle(i)}
            style={[
              styles.circle,
              isActive && { backgroundColor: `${accent.hex}26`, borderColor: `${accent.hex}40` },
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
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
});
