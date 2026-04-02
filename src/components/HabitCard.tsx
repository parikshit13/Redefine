import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Line, Polyline } from 'react-native-svg';
import GlassCard from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';
import type { Habit } from '../data/sampleHabits';

// --- Accent color map ---
const accentMap: Record<string, string> = {
  sage: colors.sage,
  lavender: colors.lavender,
  peach: colors.peach,
  sky: colors.sky,
  rose: colors.rose,
};

// --- Habit SVG icons (22x22, stroke only) ---

function DumbbellIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6.5 6.5a2 2 0 0 0-3 0l-1 1a2 2 0 0 0 0 3"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M17.5 17.5a2 2 0 0 0 3 0l1-1a2 2 0 0 0 0-3"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      <Line x1={6} y1={18} x2={18} y2={6} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Path
        d="M3 10.5l1.5 1.5"
        stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
      <Path
        d="M20.5 13.5L19 12"
        stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
      <Path
        d="M10.5 3L12 4.5"
        stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
      <Path
        d="M13.5 20.5L12 19"
        stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
    </Svg>
  );
}

function BookIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function LeafIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 20A7 7 0 0 0 9.8 6.9C15.5 4.9 20 2 20 2s-1.7 5.3-6 9.7"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M6.7 17.3C3 13.6 4 6 4 6s7.6-1 11.3 2.7"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M2 22l4-4"
        stroke={color} strokeWidth={1.5} strokeLinecap="round"
      />
    </Svg>
  );
}

function WaterdropIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function JournalIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M14 2v6h6" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={8} y1={13} x2={16} y2={13} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={8} y1={17} x2={13} y2={17} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

const iconComponents: Record<string, React.FC<{ color: string }>> = {
  dumbbell: DumbbellIcon,
  book: BookIcon,
  leaf: LeafIcon,
  waterdrop: WaterdropIcon,
  calendar: JournalIcon,
};

// --- Streak pulse icon (small) ---
function PulseIcon({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// --- Check icon ---
function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="20 6 9 17 4 12"
        stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// --- HabitCard ---

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HabitCard({ habit, onToggle }: HabitCardProps) {
  const accent = accentMap[habit.color] || colors.sage;
  const IconComponent = iconComponents[habit.icon];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
    onToggle(habit.id);
  };

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: `${accent}1F` }]}>
          {IconComponent && <IconComponent color={accent} />}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeLabel}>{habit.timeLabel}</Text>
            <View style={styles.streakBadge}>
              <PulseIcon color={accent} />
              <Text style={[styles.streakText, { color: accent }]}>
                {habit.streak} days
              </Text>
            </View>
          </View>
        </View>

        {/* Check button */}
        <AnimatedPressable
          onPress={handlePress}
          style={[
            styles.checkButton,
            habit.completedToday
              ? { backgroundColor: accent, borderColor: accent }
              : styles.checkUnchecked,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {habit.completedToday && <CheckIcon color={colors.bgDeep} />}
        </AnimatedPressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  habitName: {
    ...typography.sectionTitle,
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  timeLabel: {
    ...typography.caption,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  checkUnchecked: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
  },
});
