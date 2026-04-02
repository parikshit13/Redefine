import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme/tokens';
import GlassCard from '../components/GlassCard';
import StreakBanner from '../components/StreakBanner';
import HabitCard from '../components/HabitCard';
import { sampleHabits, Habit } from '../data/sampleHabits';

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
  const navigation = useNavigation<any>();
  const [habits, setHabits] = useState<Habit[]>(sampleHabits);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, completedToday: !h.completedToday } : h,
      ),
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.dateText}>{formatDate()}</Text>
        <Text style={styles.greetingText}>{getGreeting()}, Parikshit</Text>
      </View>

      {/* Streak Banner */}
      <StreakBanner habits={habits} />

      {/* Today's Habits */}
      <View style={styles.sectionHeader}>
        <Text style={typography.sectionTitle}>Today's habits</Text>
        <Pressable onPress={() => navigation.navigate('Add')}>
          <Text style={styles.addButton}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.habitsList}>
        {habits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
        ))}
      </View>

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
    color: colors.sage,
  },
  habitsList: {
    gap: 10,
    marginBottom: spacing.lg,
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
