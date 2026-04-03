import React, { useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors, typography, spacing, radii } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import StreakItem from '../components/StreakItem';
import BarChart from '../components/BarChart';
import HeatmapGrid from '../components/HeatmapGrid';
import ShimmerCard from '../components/ShimmerCard';
import { useStats } from '../hooks/useStats';
import { useCompletions } from '../hooks/useCompletions';
import { useToast } from '../components/Toast';

// --- Accent color map ---
const accentMap: Record<string, string> = {
  sage: colors.sage,
  lavender: colors.lavender,
  peach: colors.peach,
  sky: colors.sky,
  rose: colors.rose,
};

// --- Progress ring ---
const RING_SIZE = 48;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({ progress }: { progress: number }) {
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <View style={progressStyles.wrapper}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        <SvgCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="rgba(139,175,139,0.15)"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <SvgCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={colors.sage}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={`${RING_CIRCUMFERENCE}`}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - pct / 100)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      <Text style={progressStyles.label}>{pct}%</Text>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  wrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: colors.sage,
  },
});

function currentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return { from: `${year}-${month}-01`, to: `${year}-${month}-${lastDay}` };
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { stats, isLoading: statsLoading, isRefreshing, refetch: refetchStats, refresh } = useStats(toast.show);
  const { completions, fetchRange } = useCompletions();

  // Refetch stats and completions when this tab gains focus
  useFocusEffect(
    useCallback(() => {
      refetchStats();
      const { from, to } = currentMonthRange();
      fetchRange(from, to);
    }, [refetchStats, fetchRange]),
  );

  if (statsLoading || !stats) {
    return (
      <View style={styles.screen}>
        <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          <Text style={[typography.displayMedium, styles.title]}>Statistics</Text>
          <ShimmerCard count={5} />
        </View>
      </View>
    );
  }

  const todayPct = stats.todayProgress.percentage;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.sage}
          progressBackgroundColor={colors.bgDeep}
          colors={[colors.sage]}
        />
      }
    >
      {/* Page title */}
      <Text style={[typography.displayMedium, styles.title]}>Statistics</Text>

      {/* Featured streak card — full width */}
      <GlassCard
        accentColor={colors.sage}
        borderRadius={radii.lg}
        style={styles.featuredCard}
      >
        <View style={styles.featuredRow}>
          <View style={styles.featuredLeft}>
            <Text style={styles.featuredOverline}>CURRENT STREAK</Text>
            <View style={styles.featuredValueRow}>
              <Text style={styles.featuredNumber}>{stats.currentOverallStreak}</Text>
              <Text style={styles.featuredUnit}> days</Text>
            </View>
            <Text style={styles.featuredBest}>Best: {stats.bestOverallStreak} days</Text>
          </View>
          <ProgressRing progress={todayPct} />
        </View>
      </GlassCard>

      {/* Stat row — 2 cards */}
      <View style={styles.statRow}>
        <StatCard
          value={`${stats.completionRateThisMonth}%`}
          label="Completion rate"
          sub="This month"
          accentColor={colors.lavender}
        />
        <View style={{ width: 10 }} />
        <StatCard
          value={`${stats.totalCompletionsAllTime}`}
          label="Habits completed"
          sub="All time"
          accentColor={colors.peach}
        />
      </View>

      {/* Streak leaderboard */}
      {stats.habitStreaks.length > 0 && (
        <>
          <Text style={styles.sectionOverline}>STREAK LEADERBOARD</Text>
          <GlassCard style={styles.leaderboardCard}>
            {stats.habitStreaks.map((item, i) => (
              <StreakItem
                key={item.habitId}
                name={item.name}
                streak={item.currentStreak}
                accentColor={accentMap[item.color] || colors.sage}
                isLast={i === stats.habitStreaks.length - 1}
              />
            ))}
          </GlassCard>
        </>
      )}

      {/* Weekly completion chart */}
      <BarChart weeklyCompletion={stats.weeklyCompletion} />

      {/* Activity heatmap */}
      <HeatmapGrid
        completions={completions}
        totalHabits={stats.habitStreaks.length}
      />

      {/* Insight card */}
      <GlassCard
        accentColor={colors.lavender}
        borderRadius={radii.lg}
        style={styles.insightCard}
      >
        <Text style={styles.insightOverline}>INSIGHT</Text>
        <Text style={styles.insightBody}>
          {stats.habitStreaks.length > 0
            ? `You have ${stats.habitStreaks.length} active habits with a ${stats.completionRateThisMonth}% completion rate this month. Your longest active streak is ${stats.habitStreaks[0]?.currentStreak ?? 0} days.`
            : 'Add some habits to start tracking your progress and see insights here.'}
        </Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 20,
  },
  title: {
    marginBottom: 20,
  },

  // Featured streak card
  featuredCard: {
    padding: spacing.base + 4,
    marginBottom: spacing.base,
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredLeft: {
    flex: 1,
  },
  featuredOverline: {
    ...typography.overline,
    color: 'rgba(139,175,139,0.70)',
    marginBottom: 6,
  },
  featuredValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  featuredNumber: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.sage,
    lineHeight: 54,
  },
  featuredUnit: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.sage,
  },
  featuredBest: {
    ...typography.micro,
    marginTop: 4,
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },

  // Leaderboard
  sectionOverline: {
    ...typography.overline,
    marginBottom: spacing.md,
  },
  leaderboardCard: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },

  // Insight card
  insightCard: {
    padding: spacing.base + 4,
    marginBottom: spacing.lg,
  },
  insightOverline: {
    ...typography.overline,
    color: 'rgba(169,155,204,0.70)',
    marginBottom: spacing.sm,
  },
  insightBody: {
    ...typography.body,
    lineHeight: 22,
  },
});
