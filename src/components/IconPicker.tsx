import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle as SvgCircle, Polyline } from 'react-native-svg';
import { colors, spacing } from '../theme/tokens';

const NUM_COLUMNS = 6;
const GAP = 10;

// --- 12 SVG icons (22x22, stroke only) ---

function DumbbellIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6.5 6.5a2 2 0 0 0-3 0l-1 1a2 2 0 0 0 0 3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.5 17.5a2 2 0 0 0 3 0l1-1a2 2 0 0 0 0-3" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={6} y1={18} x2={18} y2={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M3 10.5l1.5 1.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M20.5 13.5L19 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M10.5 3L12 4.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M13.5 20.5L12 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function BookIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LeafIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M11 20A7 7 0 0 0 9.8 6.9C15.5 4.9 20 2 20 2s-1.7 5.3-6 9.7" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.7 17.3C3 13.6 4 6 4 6s7.6-1 11.3 2.7" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 22l4-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function WaterdropIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HeartIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <SvgCircle cx={12} cy={12} r={10} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PulseIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function FlagIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={4} y1={22} x2={4} y2={15} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LayersIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 17l10 5 10-5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M2 12l10 5 10-5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SunIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <SvgCircle cx={12} cy={12} r={5} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={12} y1={1} x2={12} y2={3} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={12} y1={21} x2={12} y2={23} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={1} y1={12} x2={3} y2={12} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={21} y1={12} x2={23} y2={12} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function InfinityIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M18.18 8a5 5 0 0 1 0 8M5.82 16a5 5 0 0 1 0-8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.82 16C7.57 16 9.78 14 12 12c2.22-2 4.43-4 6.18-4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5.82 8C7.57 8 9.78 10 12 12c2.22 2 4.43 4 6.18 4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WrenchIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ICONS: { key: string; Component: React.FC<{ color: string }> }[] = [
  { key: 'dumbbell', Component: DumbbellIcon },
  { key: 'book', Component: BookIcon },
  { key: 'leaf', Component: LeafIcon },
  { key: 'waterdrop', Component: WaterdropIcon },
  { key: 'heart', Component: HeartIcon },
  { key: 'clock', Component: ClockIcon },
  { key: 'pulse', Component: PulseIcon },
  { key: 'flag', Component: FlagIcon },
  { key: 'layers', Component: LayersIcon },
  { key: 'sun', Component: SunIcon },
  { key: 'infinity', Component: InfinityIcon },
  { key: 'wrench', Component: WrenchIcon },
];

interface IconPickerProps {
  selected: string;
  accentColor: string;
  onSelect: (key: string) => void;
}

export default function IconPicker({ selected, accentColor, onSelect }: IconPickerProps) {
  const { width } = useWindowDimensions();
  // Screen width minus horizontal padding (24 * 2) minus gaps between columns
  const availableWidth = width - spacing.lg * 2;
  const cellSize = (availableWidth - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  return (
    <View style={styles.grid}>
      {ICONS.map(({ key, Component }) => {
        const isSelected = selected === key;
        return (
          <Pressable
            key={key}
            onPress={() => onSelect(key)}
            style={[
              styles.cell,
              { width: cellSize, height: cellSize },
              isSelected && { backgroundColor: `${accentColor}26`, borderColor: accentColor },
            ]}
          >
            <Component color={isSelected ? accentColor : colors.textMuted} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
