import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from './GlassCard';
import { colors, typography, spacing } from '../theme/tokens';
import { Habit } from '../data/sampleHabits';

interface StreakBannerProps {
  habits: Habit[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function StreakBanner({ habits }: StreakBannerProps) {
  const longestStreak = Math.max(...habits.map((h) => h.streak));
  const bestStreak = Math.max(...habits.map((h) => h.bestStreak));
  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine today's day-of-week index (0=Mon ... 6=Sun)
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun, 1=Mon...6=Sat
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1; // convert to 0=Mon...6=Sun

  return (
    <GlassCard
      accentColor={colors.sage}
      borderRadius={20}
      style={styles.card}
    >
      {/* Top row: streak + progress */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.streakNumber}>{longestStreak}</Text>
          <Text style={styles.streakLabel}>Day streak</Text>
          <Text style={styles.bestLabel}>Personal best: {bestStreak} days</Text>
        </View>
        <View style={styles.progressSide}>
          <Text style={styles.progressNumber}>{progressPercent}%</Text>
          <Text style={styles.progressLabel}>Today's progress</Text>
        </View>
      </View>

      {/* Week dots */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, i) => {
          const isToday = i === todayIndex;
          const isCompleted = i < todayIndex; // past days this week assumed completed (streaks are active)

          return (
            <View key={label} style={styles.dayColumn}>
              {isToday ? (
                <View style={styles.todayDot} />
              ) : isCompleted ? (
                <View style={styles.completedDot} />
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
    color: colors.sage,
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
    color: colors.sage,
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
    borderTopColor: 'rgba(139,175,139,0.08)',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(139,175,139,0.70)',
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colors.sage,
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
