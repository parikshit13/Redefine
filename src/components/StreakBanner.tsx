import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';

interface StreakBannerProps {
  currentStreak: number;
  bestStreak: number;
  todayCompleted: number;
  todayTotal: number;
  todayPercentage: number;
  weeklyCompletion?: number[];
  accentColor?: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StreakBanner({
  currentStreak,
  bestStreak,
  todayCompleted,
  todayTotal,
  todayPercentage,
  weeklyCompletion,
  accentColor = colors.sage,
}: StreakBannerProps) {
  const now = new Date();
  const jsDay = now.getDay();
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1;

  return (
    <GlassCard
      accentColor={accentColor}
      borderRadius={20}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.streakNumber, { color: accentColor }]}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Day streak</Text>
          <Text style={styles.bestLabel}>Personal best: {bestStreak} days</Text>
        </View>
        <View style={styles.progressSide}>
          <Text style={[styles.progressNumber, { color: accentColor }]}>{todayPercentage}%</Text>
          <Text style={styles.progressLabel}>Today's progress</Text>
        </View>
      </View>

      <View style={[styles.weekRow, { borderTopColor: `${accentColor}14` }]}>
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIndex;
          const hasData = weeklyCompletion && weeklyCompletion.length === 7;
          const isCompleted = hasData
            ? weeklyCompletion[i] > 0 && !isToday
            : i < todayIndex;

          return (
            <View key={label} style={styles.dayColumn}>
              {isToday ? (
                <View
                  style={
                    todayPercentage >= 100
                      ? [styles.completedDot, { backgroundColor: `${accentColor}B3` }]
                      : [styles.todayDot, { borderColor: accentColor }]
                  }
                />
              ) : isCompleted ? (
                <View style={[styles.completedDot, { backgroundColor: `${accentColor}B3` }]} />
              ) : (
                <View style={styles.emptyDot} />
              )}
              <Text style={styles.dayLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.base,
  },
  streakNumber: {
    fontSize: 42,
    fontWeight: '300',
    lineHeight: 48,
  },
  streakLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  bestLabel: {
    ...typography.micro,
    marginTop: 2,
  },
  progressSide: {
    alignItems: 'flex-end',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  progressLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dayLabel: {
    ...typography.micro,
  },
});
