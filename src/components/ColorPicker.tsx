import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

type ColorName = 'sage' | 'lavender' | 'peach' | 'sky' | 'rose';

const COLOR_OPTIONS: { name: ColorName; hex: string }[] = [
  { name: 'sage', hex: colors.sage },
  { name: 'lavender', hex: colors.lavender },
  { name: 'peach', hex: colors.peach },
  { name: 'sky', hex: colors.sky },
  { name: 'rose', hex: colors.rose },
];

interface ColorPickerProps {
  selected: ColorName;
  onSelect: (name: ColorName) => void;
}

export default function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View style={styles.row}>
      {COLOR_OPTIONS.map(({ name, hex }) => {
        const isSelected = selected === name;
        return (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            style={[styles.outerRing, isSelected && styles.outerRingActive]}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: hex },
                isSelected && styles.circleActive,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  outerRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRingActive: {
    borderColor: 'rgba(255,255,255,0.20)',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  circleActive: {
    borderColor: 'rgba(255,255,255,0.90)',
  },
});
