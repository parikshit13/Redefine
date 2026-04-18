import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export interface HabitLike {
  id: string;
  name: string;
  reminderTime?: string | null;
  reminderEnabled?: boolean | null;
  days: number[] | string;
}

// Map our day convention (0=Mon..6=Sun) to Expo weekly trigger (1=Sun..7=Sat)
const toExpoWeekday = (day: number): number => (day === 6 ? 1 : day + 2);

function normalizeDays(days: number[] | string): number[] {
  if (Array.isArray(days)) return days;
  return days
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    return false;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  time: string,
  days: number[],
): Promise<void> {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  for (const day of days) {
    await Notifications.scheduleNotificationAsync({
      identifier: `habit-${habitId}-day-${day}`,
      content: {
        title: 'Redefine',
        body: `Time for: ${habitName}`,
        sound: 'default',
        data: { habitId },
      },
      trigger: {
        type: 'weekly',
        weekday: toExpoWeekday(day),
        hour,
        minute,
        channelId: 'habit-reminders',
      } as any,
    });
  }
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  for (let day = 0; day <= 6; day++) {
    await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}-day-${day}`);
  }
}

export async function rescheduleAllReminders(habits: HabitLike[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const habit of habits) {
    if (habit.reminderEnabled && habit.reminderTime) {
      await scheduleHabitReminder(
        habit.id,
        habit.name,
        habit.reminderTime,
        normalizeDays(habit.days),
      );
    }
  }
}

export async function scheduleDailySummary(hour: number, minute: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-summary',
    content: {
      title: 'Redefine',
      body: 'How did your habits go today? Check in and keep your streak alive.',
      sound: 'default',
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
      channelId: 'habit-reminders',
    } as any,
  });
}

export async function cancelDailySummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync('daily-summary');
}
