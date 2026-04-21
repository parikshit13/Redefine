import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, StyleSheet, Alert, ActionSheetIOS, Platform } from 'react-native';
import Reanimated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { colors, typography, spacing } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import StreakBanner from '../components/StreakBanner';
import HabitCard from '../components/HabitCard';
import ShimmerCard from '../components/ShimmerCard';
import HabitActionSheet from '../components/HabitActionSheet';
import { useHabits, HabitWithStreaks } from '../hooks/useHabits';
import { useStats } from '../hooks/useStats';
import { useToast } from '../components/Toast';
import { useAccent } from '../context/ThemeContext';
import { quotes } from '../data/quotes';

const QUOTE_HINT_KEY = 'redefine.quoteHintSeen.v1';

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

function todayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const toast = useToast();
  const { accent } = useAccent();
  const { habits, isLoading, isRefreshing, toggleCompletion, deleteHabit, refetch, refresh } = useHabits(toast.show);
  const { stats, isRefreshing: statsRefreshing, refetch: refetchStats } = useStats(toast.show);

  const [sheetHabit, setSheetHabit] = useState<HabitWithStreaks | null>(null);
  const [showHint, setShowHint] = useState(false);

  const dailyQuoteIndex = useMemo(() => hashString(todayDateKey()) % quotes.length, []);
  const [quoteIndex, setQuoteIndex] = useState(dailyQuoteIndex);
  const quoteOpacity = useSharedValue(1);
  const quoteStyle = useAnimatedStyle(() => ({ opacity: quoteOpacity.value }));

  useEffect(() => {
    AsyncStorage.getItem(QUOTE_HINT_KEY).then((v) => {
      if (!v) setShowHint(true);
    });
  }, []);

  // Refetch habits and stats when this tab gains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchStats();
    }, [refetch, refetchStats]),
  );

  const todayTotal = habits.length;
  const todayCompleted = habits.filter((h) => h.completedToday).length;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  const handleToggle = useCallback(
    (habitId: string) => {
      toggleCompletion(habitId).then(() => refetchStats());
    },
    [toggleCompletion, refetchStats],
  );

  const handleRefresh = useCallback(async () => {
    await Promise.all([refresh(), refetchStats()]);
  }, [refresh, refetchStats]);

  const firstName = user?.firstName || 'there';

  const openActions = useCallback((habit: HabitWithStreaks) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
          title: habit.name,
          userInterfaceStyle: 'dark',
        },
        (i) => {
          if (i === 1) handleEdit(habit);
          else if (i === 2) confirmDelete(habit);
        },
      );
    } else {
      setSheetHabit(habit);
    }
  }, []);

  const handleEdit = useCallback((habit: HabitWithStreaks) => {
    setSheetHabit(null);
    router.push({ pathname: '/add', params: { habitId: habit.id } });
  }, [router]);

  const confirmDelete = useCallback((habit: HabitWithStreaks) => {
    setSheetHabit(null);
    Alert.alert(
      'Delete habit?',
      `"${habit.name}" and its history will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit.id);
              refetchStats();
            } catch {
              // Toast shown inside deleteHabit
            }
          },
        },
      ],
    );
  }, [deleteHabit, refetchStats]);

  const pickRandomQuote = useCallback(() => {
    let next = quoteIndex;
    if (quotes.length > 1) {
      while (next === quoteIndex) next = Math.floor(Math.random() * quotes.length);
    }
    setQuoteIndex(next);
  }, [quoteIndex]);

  const handleQuotePress = useCallback(() => {
    if (showHint) {
      setShowHint(false);
      AsyncStorage.setItem(QUOTE_HINT_KEY, '1').catch(() => {});
    }
    quoteOpacity.value = withTiming(0, { duration: 300 }, (done) => {
      if (done) {
        runOnJS(pickRandomQuote)();
        quoteOpacity.value = withTiming(1, { duration: 300 });
      }
    });
  }, [pickRandomQuote, showHint, quoteOpacity]);

  const quote = quotes[quoteIndex];

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
      <View style={styles.greeting}>
        <Text style={styles.dateText}>{formatDate()}</Text>
        <Text style={styles.greetingText}>{getGreeting()}, {firstName}</Text>
      </View>

      <StreakBanner
        currentStreak={stats?.currentOverallStreak ?? 0}
        bestStreak={stats?.bestOverallStreak ?? 0}
        todayCompleted={todayCompleted}
        todayTotal={todayTotal}
        todayPercentage={todayPercentage}
        weeklyCompletion={stats?.weeklyCompletion}
        accentColor={accent.hex}
      />

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
              onLongPress={openActions}
            />
          ))}
        </View>
      )}

      {/* Quote Card — tap to refresh */}
      <Pressable onPress={handleQuotePress}>
        <Reanimated.View style={quoteStyle}>
          <GlassCard accentColor={colors.lavender} style={styles.quoteCard}>
            <Text style={styles.quoteText}>{quote.text}</Text>
            <Text style={styles.quoteAuthor}>— {quote.author.toUpperCase()}</Text>
            {showHint && (
              <Text style={styles.quoteHint}>Tap for a new quote</Text>
            )}
          </GlassCard>
        </Reanimated.View>
      </Pressable>

      <HabitActionSheet
        visible={!!sheetHabit}
        habitName={sheetHabit?.name || ''}
        onEdit={() => sheetHabit && handleEdit(sheetHabit)}
        onDelete={() => sheetHabit && confirmDelete(sheetHabit)}
        onCancel={() => setSheetHabit(null)}
      />
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
  quoteHint: {
    ...typography.micro,
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
