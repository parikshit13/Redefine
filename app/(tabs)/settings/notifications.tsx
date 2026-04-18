import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Alert,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../../../src/theme/tokens';
import GlassCard from '../../../src/components/GlassCard';
import SettingsHeader from '../../../src/components/SettingsHeader';
import TimePickerModal, { formatDisplayTime } from '../../../src/components/TimePickerModal';
import { useHabits, HabitWithStreaks } from '../../../src/hooks/useHabits';
import { apiFetch } from '../../../src/lib/api';
import { useToast } from '../../../src/components/Toast';
import { useAccent } from '../../../src/context/ThemeContext';
import {
  requestPermissions,
  scheduleHabitReminder,
  cancelHabitReminder,
  rescheduleAllReminders,
  scheduleDailySummary,
  cancelDailySummary,
} from '../../../src/lib/notifications';

const DAILY_SUMMARY_ENABLED_KEY = 'dailySummaryEnabled';
const DAILY_SUMMARY_TIME_KEY = 'dailySummaryTime';
const PUSH_MASTER_ENABLED_KEY = 'redefine_push_master_enabled';

function parseDays(days: string | number[] | null | undefined): number[] {
  if (!days) return [];
  if (Array.isArray(days)) return days;
  return days
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

const accentMap: Record<string, string> = {
  sage: colors.sage,
  lavender: colors.lavender,
  peach: colors.peach,
  sky: colors.sky,
  rose: colors.rose,
};

function ToggleSwitch({ value, onToggle, trackOnColor }: { value: boolean; onToggle: () => void; trackOnColor?: string }) {
  const translateX = useRef(new Animated.Value(value ? 20 : 2)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 20 : 2,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  }, [value]);

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.toggleTrack, value && [styles.toggleTrackOn, trackOnColor ? { backgroundColor: trackOnColor } : null]]}
    >
      <Animated.View
        style={[styles.toggleThumb, { transform: [{ translateX }] }]}
      />
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const toast = useToast();
  const { getToken } = useAuth();
  const { accent } = useAccent();
  const { habits, isLoading, refetch } = useHabits();

  const [pushEnabled, setPushEnabled] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(false);
  const [dailySummaryTime, setDailySummaryTime] = useState('21:00');
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<
    { type: 'habit'; habitId: string } | { type: 'summary' } | null
  >(null);
  const [timePickerValue, setTimePickerValue] = useState('07:00');

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      const masterFlag = await AsyncStorage.getItem(PUSH_MASTER_ENABLED_KEY);
      const masterOn = masterFlag !== '0';
      setPushEnabled(status === 'granted' && masterOn);
      setCheckingPermission(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const enabled = await AsyncStorage.getItem(DAILY_SUMMARY_ENABLED_KEY);
      const time = await AsyncStorage.getItem(DAILY_SUMMARY_TIME_KEY);
      if (enabled === '1') setDailySummaryEnabled(true);
      if (time) setDailySummaryTime(time);
    })();
  }, []);

  const handleMasterToggle = async () => {
    if (pushEnabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setPushEnabled(false);
      await AsyncStorage.setItem(PUSH_MASTER_ENABLED_KEY, '0');
      return;
    }

    const granted = await requestPermissions();
    if (granted) {
      setPushEnabled(true);
      await AsyncStorage.setItem(PUSH_MASTER_ENABLED_KEY, '1');
      await rescheduleAllReminders(habits.filter((h) => h.reminderEnabled && h.reminderTime));
      if (dailySummaryEnabled) {
        const [h, m] = dailySummaryTime.split(':').map((n) => parseInt(n, 10));
        await scheduleDailySummary(h, m);
      }
    } else {
      Alert.alert(
        'Please enable notifications in your device Settings',
        undefined,
        [
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    }
  };

  const updateHabitReminder = useCallback(
    async (habitId: string, updates: { reminderEnabled?: boolean; reminderTime?: string | null }) => {
      setUpdatingHabitId(habitId);
      try {
        const token = await getToken();
        await apiFetch(`/api/habits/${habitId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        }, token);
        await refetch();
      } catch (err: any) {
        toast.show(err.message || 'Failed to update reminder');
      } finally {
        setUpdatingHabitId(null);
      }
    },
    [getToken, refetch, toast],
  );

  const handleHabitToggle = async (habit: HabitWithStreaks) => {
    const newEnabled = !habit.reminderEnabled;

    if (newEnabled) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Please enable notifications in your device Settings');
        return;
      }
      if (!habit.reminderTime) {
        setTimePickerTarget({ type: 'habit', habitId: habit.id });
        setTimePickerValue('07:00');
        setTimePickerVisible(true);
        return;
      }
      await updateHabitReminder(habit.id, { reminderEnabled: true });
      try {
        await scheduleHabitReminder(
          habit.id,
          habit.name,
          habit.reminderTime,
          parseDays(habit.days),
        );
      } catch {}
    } else {
      await updateHabitReminder(habit.id, { reminderEnabled: false });
      try {
        await cancelHabitReminder(habit.id);
      } catch {}
    }
  };

  const handleHabitTimeTap = (habit: HabitWithStreaks) => {
    setTimePickerTarget({ type: 'habit', habitId: habit.id });
    setTimePickerValue(habit.reminderTime || '07:00');
    setTimePickerVisible(true);
  };

  const handleDailySummaryToggle = async () => {
    const next = !dailySummaryEnabled;

    if (next) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert('Please enable notifications in your device Settings');
          return;
        }
      }
      setDailySummaryEnabled(true);
      await AsyncStorage.setItem(DAILY_SUMMARY_ENABLED_KEY, '1');
      try {
        const [h, m] = dailySummaryTime.split(':').map((n) => parseInt(n, 10));
        await scheduleDailySummary(h, m);
      } catch {}
    } else {
      setDailySummaryEnabled(false);
      await AsyncStorage.setItem(DAILY_SUMMARY_ENABLED_KEY, '0');
      try {
        await cancelDailySummary();
      } catch {}
    }
  };

  const handleDailySummaryTimeTap = () => {
    setTimePickerTarget({ type: 'summary' });
    setTimePickerValue(dailySummaryTime);
    setTimePickerVisible(true);
  };

  const handleTimePickerSave = async (time: string) => {
    setTimePickerVisible(false);
    if (!timePickerTarget) return;

    if (timePickerTarget.type === 'habit') {
      const habitId = timePickerTarget.habitId;
      const habit = habits.find((h) => h.id === habitId);
      await updateHabitReminder(habitId, {
        reminderEnabled: true,
        reminderTime: time,
      });
      if (habit) {
        try {
          await cancelHabitReminder(habitId);
          await scheduleHabitReminder(habitId, habit.name, time, parseDays(habit.days));
        } catch {}
      }
    } else {
      setDailySummaryTime(time);
      await AsyncStorage.setItem(DAILY_SUMMARY_TIME_KEY, time);
      if (dailySummaryEnabled) {
        try {
          await cancelDailySummary();
          const [h, m] = time.split(':').map((n) => parseInt(n, 10));
          await scheduleDailySummary(h, m);
        } catch {}
      }
    }
    setTimePickerTarget(null);
  };

  return (
    <View style={styles.screen}>
      <SettingsHeader title="Notifications" />
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Master toggle */}
      <GlassCard style={styles.masterCard}>
        <View style={styles.masterRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterTitle}>Push notifications</Text>
            <Text style={styles.masterSub}>
              {pushEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          {checkingPermission ? (
            <ActivityIndicator color={accent.hex} size="small" />
          ) : (
            <ToggleSwitch value={pushEnabled} onToggle={handleMasterToggle} trackOnColor={accent.trackOn} />
          )}
        </View>
      </GlassCard>

      {/* Habit reminders */}
      <Text style={styles.sectionLabel}>HABIT REMINDERS</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={accent.hex} size="small" />
        </View>
      ) : habits.length === 0 ? (
        <Text style={styles.emptyText}>No habits yet</Text>
      ) : (
        <GlassCard style={styles.habitsCard}>
          {habits.map((habit, i) => {
            const habitColor = accentMap[habit.color] || colors.sage;
            const isUpdating = updatingHabitId === habit.id;
            return (
              <View
                key={habit.id}
                style={[
                  styles.habitRow,
                  i < habits.length - 1 && styles.habitRowBorder,
                ]}
              >
                <View style={[styles.colorDot, { backgroundColor: habitColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Pressable onPress={() => handleHabitTimeTap(habit)} hitSlop={6}>
                    <Text style={styles.habitTime}>
                      {habit.reminderEnabled && habit.reminderTime
                        ? formatDisplayTime(habit.reminderTime)
                        : 'Off'}
                    </Text>
                  </Pressable>
                </View>
                {isUpdating ? (
                  <ActivityIndicator color={habitColor} size="small" />
                ) : (
                  <ToggleSwitch
                    value={!!habit.reminderEnabled}
                    onToggle={() => handleHabitToggle(habit)}
                    trackOnColor={`${habitColor}80`}
                  />
                )}
              </View>
            );
          })}
        </GlassCard>
      )}

      {/* Daily summary */}
      <Text style={styles.sectionLabel}>DAILY SUMMARY</Text>

      <GlassCard style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.masterTitle}>Daily progress summary</Text>
            <Text style={styles.masterSub}>
              Get a recap of your day's habits
            </Text>
          </View>
          <ToggleSwitch
            value={dailySummaryEnabled}
            onToggle={handleDailySummaryToggle}
            trackOnColor={accent.trackOn}
          />
        </View>
        {dailySummaryEnabled && (
          <>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTimeRow}>
              <Text style={styles.summaryTimeLabel}>Send at</Text>
              <Pressable onPress={handleDailySummaryTimeTap} hitSlop={6}>
                <Text style={[styles.summaryTimeValue, { color: accent.hex }]}>
                  {formatDisplayTime(dailySummaryTime)}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </GlassCard>

      <TimePickerModal
        visible={timePickerVisible}
        value={timePickerValue}
        title={
          timePickerTarget?.type === 'summary'
            ? 'Summary time'
            : 'Reminder time'
        }
        onClose={() => {
          setTimePickerVisible(false);
          setTimePickerTarget(null);
        }}
        onSave={handleTimePickerSave}
      />
    </ScrollView>
    </View>
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
    paddingTop: spacing.base,
  },

  // Master toggle
  masterCard: {
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterTitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: colors.textPrimary,
  },
  masterSub: {
    ...typography.micro,
    marginTop: 3,
  },

  // Section label
  sectionLabel: {
    ...typography.overline,
    marginBottom: spacing.md,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Habit rows
  habitsCard: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  habitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  habitName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textPrimary,
  },
  habitTime: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Daily summary
  summaryCard: {
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: 12,
  },
  summaryTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTimeLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryTimeValue: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },

  // Toggle
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  toggleTrackOn: {},
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
