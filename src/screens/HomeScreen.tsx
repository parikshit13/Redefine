import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, typography, spacing } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import StreakBanner from '../components/StreakBanner';
import HabitCard from '../components/HabitCard';
import ShimmerCard from '../components/ShimmerCard';
import { useHabits } from '../hooks/useHabits';
import { useStats } from '../hooks/useStats';
import { useToast } from '../components/Toast';
import { useAccent } from '../context/ThemeContext';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  const now = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const months = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
  ];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const toast = useToast();
  const { accent } = useAccent();
  const { habits, isLoading, isRefreshing, toggleCompletion, refetch, refresh } = useHabits(toast.show);
  const { stats, isRefreshing: statsRefreshing, refetch: refetchStats } = useStats(toast.show);

  // Refetch habits and stats when this tab gains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchStats();
    }, [refetch, refetchStats]),
  );

  // Compute today's progress directly from habits array — updates instantly with optimistic toggle
  const todayTotal = habits.length;
  const todayCompleted = habits.filter((h) => h.completedToday).length;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Wrap toggleCompletion to also trigger a stats refetch (for streaks, week dots)
  const handleToggle = useCallback(
    (habitId: string) => {
      toggleCompletion(habitId).then(() => refetchStats());
    },
    [toggleCompletion, refetchStats],
  );

  // Pull-to-refresh refreshes both habits and stats
  const handleRefresh = useCallback(async () => {
    await Promise.all([refresh(), refetchStats()]);
  }, [refresh, refetchStats]);

  const firstName = user?.firstName || 'there';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing || statsRefreshing}
          onRefresh={handleRefresh}
          tintColor={accent.hex}
          progressBackgroundColor={colors.bgDeep}
          colors={[accent.hex]}
        />
      }
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.dateText}>{formatDate()}</Text>
        <Text style={styles.greetingText}>{getGreeting()}, {firstName}</Text>
      </View>

      {/* Streak Banner — today's progress from local habits, streaks from server stats */}
      <StreakBanner
        currentStreak={stats?.currentOverallStreak ?? 0}
        bestStreak={stats?.bestOverallStreak ?? 0}
        todayCompleted={todayCompleted}
        todayTotal={todayTotal}
        todayPercentage={todayPercentage}
        weeklyCompletion={stats?.weeklyCompletion}
        accentColor={accent.hex}
      />

      {/* Today's Habits */}
      <View style={styles.sectionHeader}>
        <Text style={typography.sectionTitle}>Today's habits</Text>
        <Pressable onPress={() => router.push('/add')}>
          <Text style={[styles.addButton, { color: accent.hex }]}>+ Add</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ShimmerCard count={4} />
      ) : habits.length === 0 ? (
        <GlassCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>No habits yet. Tap "+ Add" to create one.</Text>
        </GlassCard>
      ) : (
        <View style={styles.habitsList}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
            />
          ))}
        </View>
      )}

      {/* Quote Card */}
      <GlassCard accentColor={colors.lavender} style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          We are what we repeatedly do. Excellence, then, is not an act, but a habit.
        </Text>
        <Text style={styles.quoteAuthor}>— Aristotle</Text>
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
    paddingBottom: spacing.xxl,
  },
  greeting: {
    marginBottom: spacing.lg,
  },
  dateText: {
    ...typography.overline,
    marginBottom: spacing.sm,
  },
  greetingText: {
    ...typography.displayLarge,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    ...typography.caption,
  },
  habitsList: {
    gap: 10,
    marginBottom: spacing.lg,
  },
  emptyCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  },
  quoteCard: {
    padding: spacing.base + 4,
  },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  quoteAuthor: {
    ...typography.micro,
  },
});
