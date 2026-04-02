import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors, typography, spacing, radii } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import StreakItem from '../components/StreakItem';
import BarChart from '../components/BarChart';
import HeatmapGrid from '../components/HeatmapGrid';

// --- Progress ring ---
const RING_SIZE = 48;
const RING_STROKE = 4;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_PROGRESS = 0.67;

function ProgressRing() {
  return (
    <View style={progressStyles.wrapper}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Background track */}
        <SvgCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke="rgba(139,175,139,0.15)"
          strokeWidth={RING_STROKE}
          fill="none"
        />
        {/* Progress arc */}
        <SvgCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          stroke={colors.sage}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={`${RING_CIRCUMFERENCE}`}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - RING_PROGRESS)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      <Text style={progressStyles.label}>67%</Text>
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

// --- Streak leaderboard data (sorted desc) ---
const LEADERBOARD = [
  { name: 'Drink 2L water', streak: 22, color: colors.sky },
  { name: 'Morning workout', streak: 14, color: colors.sage },
  { name: 'Read 30 minutes', streak: 9, color: colors.lavender },
  { name: 'Meditate', streak: 6, color: colors.peach },
  { name: 'Journal before bed', streak: 3, color: colors.rose },
];

// --- StatsScreen ---
export default function StatsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
      showsVerticalScrollIndicator={false}
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
              <Text style={styles.featuredNumber}>14</Text>
              <Text style={styles.featuredUnit}> days</Text>
            </View>
            <Text style={styles.featuredBest}>Best: 21 days (Feb 2026)</Text>
          </View>
          <ProgressRing />
        </View>
      </GlassCard>

      {/* Stat row — 2 cards */}
      <View style={styles.statRow}>
        <StatCard
          value="87%"
          label="Completion rate"
          sub="This month"
          accentColor={colors.lavender}
        />
        <View style={{ width: 10 }} />
        <StatCard
          value="142"
          label="Habits completed"
          sub="All time"
          accentColor={colors.peach}
        />
      </View>

      {/* Streak leaderboard */}
      <Text style={styles.sectionOverline}>STREAK LEADERBOARD</Text>
      <GlassCard style={styles.leaderboardCard}>
        {LEADERBOARD.map((item, i) => (
          <StreakItem
            key={item.name}
            name={item.name}
            streak={item.streak}
            accentColor={item.color}
            isLast={i === LEADERBOARD.length - 1}
          />
        ))}
      </GlassCard>

      {/* Weekly completion chart */}
      <BarChart />

      {/* Activity heatmap */}
      <HeatmapGrid />

      {/* Insight card */}
      <GlassCard
        accentColor={colors.lavender}
        borderRadius={radii.lg}
        style={styles.insightCard}
      >
        <Text style={styles.insightOverline}>INSIGHT</Text>
        <Text style={styles.insightBody}>
          You're most consistent on Tuesdays and Thursdays. Morning habits have
          a 92% completion rate vs 68% for evening ones.
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
