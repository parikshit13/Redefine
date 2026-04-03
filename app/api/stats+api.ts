import { db } from '../../server/db';
import { habits, completions } from '../../server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '../../server/db/auth';
import { computeHabitStreaks, computeOverallStreaks } from '../../server/db/streaks';

/** Format Date to YYYY-MM-DD */
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get the Monday of the week containing the given date */
function getMonday(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? 6 : day - 1; // distance to Monday
  result.setDate(result.getDate() - diff);
  return result;
}

function dayIndex(d: Date): number {
  return (d.getDay() + 6) % 7; // 0=Mon..6=Sun
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const today = url.searchParams.get('today') || toDateStr(new Date());
    const todayDate = new Date(today + 'T00:00:00');

    // Fetch active habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, user.id), eq(habits.isArchived, false)));

    // --- Overall streaks ---
    const { currentOverallStreak, bestOverallStreak } =
      await computeOverallStreaks(user.id, today);

    // --- Per-habit streaks ---
    const habitStreaks = await Promise.all(
      userHabits.map(async (habit) => {
        const { currentStreak, bestStreak } = await computeHabitStreaks(
          habit.id,
          habit,
          today,
        );
        return {
          habitId: habit.id,
          name: habit.name,
          color: habit.color,
          currentStreak,
          bestStreak,
        };
      }),
    );

    // Sort by currentStreak descending
    habitStreaks.sort((a, b) => b.currentStreak - a.currentStreak);

    // --- Completion rate this month ---
    const monthStart = `${today.slice(0, 7)}-01`;
    const monthCompletions = await db
      .select()
      .from(completions)
      .where(
        and(
          eq(completions.userId, user.id),
          // gte/lte inline: fetch all for this user, filter in JS for simplicity
        ),
      );

    // Filter to this month
    const thisMonthCompletions = monthCompletions.filter(
      (c) => c.date >= monthStart && c.date <= today,
    );

    // Count expected completions this month (each scheduled habit-day)
    let expectedThisMonth = 0;
    const cursor = new Date(monthStart + 'T00:00:00');
    while (toDateStr(cursor) <= today) {
      for (const habit of userHabits) {
        const scheduledDays = habit.days.split(',').map(Number);
        if (scheduledDays.includes(dayIndex(cursor))) {
          expectedThisMonth++;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    const completionRateThisMonth =
      expectedThisMonth > 0
        ? Math.round((thisMonthCompletions.length / expectedThisMonth) * 100)
        : 0;

    // --- Total completions all time ---
    const totalCompletionsAllTime = monthCompletions.length;

    // --- Weekly completion (Mon–Sun, percentage per day) ---
    const monday = getMonday(todayDate);
    const weeklyCompletion: number[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dateStr = toDateStr(d);

      // Skip future days
      if (dateStr > today) {
        weeklyCompletion.push(0);
        continue;
      }

      // How many habits were scheduled this day?
      let scheduled = 0;
      let completed = 0;
      for (const habit of userHabits) {
        const scheduledDays = habit.days.split(',').map(Number);
        if (scheduledDays.includes(dayIndex(d))) {
          scheduled++;
          if (
            monthCompletions.some(
              (c) => c.habitId === habit.id && c.date === dateStr,
            )
          ) {
            completed++;
          }
        }
      }

      weeklyCompletion.push(
        scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
      );
    }

    // --- Today's progress ---
    const todayCompletions = monthCompletions.filter((c) => c.date === today);
    let scheduledToday = 0;
    for (const habit of userHabits) {
      const scheduledDays = habit.days.split(',').map(Number);
      if (scheduledDays.includes(dayIndex(todayDate))) {
        scheduledToday++;
      }
    }

    const todayProgress = {
      completed: todayCompletions.length,
      total: scheduledToday,
      percentage:
        scheduledToday > 0
          ? Math.round((todayCompletions.length / scheduledToday) * 100)
          : 0,
    };

    return Response.json({
      currentOverallStreak,
      bestOverallStreak,
      completionRateThisMonth,
      totalCompletionsAllTime,
      habitStreaks,
      weeklyCompletion,
      todayProgress,
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
