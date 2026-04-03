import { db } from '../../server/db';
import { habits, completions } from '../../server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '../../server/db/auth';
import { computeHabitStreaks } from '../../server/db/streaks';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's date from query param (client sends local date) or fallback to server date
    const url = new URL(request.url);
    const today =
      url.searchParams.get('today') ||
      new Date().toISOString().split('T')[0];

    // Fetch active habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, user.id), eq(habits.isArchived, false)));

    // Get today's completions for this user
    const todayCompletions = await db
      .select({ habitId: completions.habitId })
      .from(completions)
      .where(and(eq(completions.userId, user.id), eq(completions.date, today)));

    const completedTodaySet = new Set(todayCompletions.map((c) => c.habitId));

    // Compute streaks for each habit
    const habitsWithStreaks = await Promise.all(
      userHabits.map(async (habit) => {
        const { currentStreak, bestStreak } = await computeHabitStreaks(
          habit.id,
          habit,
          today,
        );
        return {
          ...habit,
          completedToday: completedTodaySet.has(habit.id),
          currentStreak,
          bestStreak,
        };
      }),
    );

    return Response.json(habitsWithStreaks);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      icon,
      color,
      timeLabel,
      frequency,
      days,
      reminderTime,
      reminderEnabled,
      goalCount,
      goalDuration,
    } = body;

    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }

    const [habit] = await db
      .insert(habits)
      .values({
        userId: user.id,
        name,
        icon: icon || 'clock',
        color: color || 'sage',
        timeLabel: timeLabel || '',
        frequency: frequency || 'daily',
        days: days || '0,1,2,3,4,5,6',
        reminderTime: reminderTime || null,
        reminderEnabled: reminderEnabled ?? false,
        goalCount: goalCount ?? 1,
        goalDuration: goalDuration ?? 0,
      })
      .returning();

    return Response.json(habit, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
