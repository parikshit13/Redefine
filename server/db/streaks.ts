import { db } from './index';
import { completions, habits } from './schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Habit } from './schema';

/** Format a Date to YYYY-MM-DD string */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Subtract N days from a date */
function subtractDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - n);
  return result;
}

/** Get the day-of-week index (0 = Monday … 6 = Sunday) from a Date */
function dayIndex(d: Date): number {
  // JS getDay: 0=Sun, 1=Mon … 6=Sat → convert to 0=Mon … 6=Sun
  return (d.getDay() + 6) % 7;
}

/** Check if a habit is scheduled on a given date */
function isScheduled(habit: Habit, d: Date): boolean {
  const scheduledDays = habit.days.split(',').map(Number); // 0=Mon..6=Sun
  return scheduledDays.includes(dayIndex(d));
}

/**
 * Compute current streak and best streak for a single habit.
 * Walks backwards from today, skipping days the habit isn't scheduled.
 */
export async function computeHabitStreaks(
  habitId: string,
  habit: Habit,
  today: string,
) {
  // Get all completions for this habit sorted by date desc
  const allCompletions = await db
    .select({ date: completions.date })
    .from(completions)
    .where(eq(completions.habitId, habitId))
    .orderBy(desc(completions.date));

  const completionSet = new Set(allCompletions.map((c) => c.date));

  // --- Current streak ---
  let currentStreak = 0;
  const todayDate = new Date(today + 'T00:00:00');
  let cursor = new Date(todayDate);

  // If today is scheduled but not completed, start from yesterday
  if (isScheduled(habit, cursor) && !completionSet.has(today)) {
    cursor = subtractDays(cursor, 1);
  }

  // Walk backwards counting consecutive completed scheduled days
  for (let i = 0; i < 365; i++) {
    if (!isScheduled(habit, cursor)) {
      cursor = subtractDays(cursor, 1);
      continue;
    }
    const dateStr = toDateStr(cursor);
    if (completionSet.has(dateStr)) {
      currentStreak++;
      cursor = subtractDays(cursor, 1);
    } else {
      break;
    }
  }

  // --- Best streak ---
  // Walk through all completions chronologically and find the longest run
  const sortedDates = allCompletions.map((c) => c.date).sort();
  let bestStreak = 0;
  let runLength = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const d = new Date(dateStr + 'T00:00:00');
    if (prevDate === null) {
      runLength = 1;
    } else {
      // Count scheduled days between prevDate and d (exclusive)
      let gap = false;
      const check = new Date(prevDate);
      check.setDate(check.getDate() + 1);
      while (toDateStr(check) < dateStr) {
        if (isScheduled(habit, check)) {
          gap = true;
          break;
        }
        check.setDate(check.getDate() + 1);
      }
      if (gap) {
        runLength = 1;
      } else {
        runLength++;
      }
    }
    bestStreak = Math.max(bestStreak, runLength);
    prevDate = d;
  }

  return { currentStreak, bestStreak };
}

/**
 * Compute the overall streak: consecutive days where the user completed
 * ALL scheduled habits for that day. Walks backwards from today.
 */
export async function computeOverallStreaks(
  userId: string,
  today: string,
) {
  // Get all active habits for user
  const userHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isArchived, false)));

  if (userHabits.length === 0) {
    return { currentOverallStreak: 0, bestOverallStreak: 0 };
  }

  // Get all completions for user
  const allCompletions = await db
    .select({ habitId: completions.habitId, date: completions.date })
    .from(completions)
    .where(eq(completions.userId, userId));

  // Build a map: date -> set of completed habit IDs
  const completionMap = new Map<string, Set<string>>();
  for (const c of allCompletions) {
    if (!completionMap.has(c.date)) {
      completionMap.set(c.date, new Set());
    }
    completionMap.get(c.date)!.add(c.habitId);
  }

  /** Check if all scheduled habits were completed on a given date */
  function allCompletedOn(d: Date): boolean {
    const dateStr = toDateStr(d);
    const scheduled = userHabits.filter((h) => isScheduled(h, d));
    if (scheduled.length === 0) return true; // no habits scheduled = counts as complete
    const done = completionMap.get(dateStr) ?? new Set();
    return scheduled.every((h) => done.has(h.id));
  }

  // --- Current overall streak ---
  let currentOverallStreak = 0;
  const todayDate = new Date(today + 'T00:00:00');
  let cursor = new Date(todayDate);

  // If today isn't fully complete, start from yesterday
  if (!allCompletedOn(cursor)) {
    cursor = subtractDays(cursor, 1);
  }

  for (let i = 0; i < 365; i++) {
    // Skip days with no scheduled habits
    const scheduledToday = userHabits.filter((h) => isScheduled(h, cursor));
    if (scheduledToday.length === 0) {
      cursor = subtractDays(cursor, 1);
      continue;
    }
    if (allCompletedOn(cursor)) {
      currentOverallStreak++;
      cursor = subtractDays(cursor, 1);
    } else {
      break;
    }
  }

  // --- Best overall streak (scan last 365 days) ---
  let bestOverallStreak = 0;
  let run = 0;
  for (let i = 365; i >= 0; i--) {
    const d = subtractDays(todayDate, i);
    const scheduled = userHabits.filter((h) => isScheduled(h, d));
    if (scheduled.length === 0) continue; // skip unscheduled days
    if (allCompletedOn(d)) {
      run++;
      bestOverallStreak = Math.max(bestOverallStreak, run);
    } else {
      run = 0;
    }
  }

  return { currentOverallStreak, bestOverallStreak };
}
