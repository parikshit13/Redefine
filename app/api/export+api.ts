import { db } from '../../server/db';
import { habits, completions } from '../../server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getUserFromRequest } from '../../server/db/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    if (!from || !to) {
      return Response.json({ error: 'from and to query params required' }, { status: 400 });
    }

    // Fetch all non-archived habits for the user
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, user.id), eq(habits.isArchived, false)));

    // Fetch all completions in the date range
    const userCompletions = await db
      .select()
      .from(completions)
      .where(
        and(
          eq(completions.userId, user.id),
          gte(completions.date, from),
          lte(completions.date, to),
        ),
      );

    // Build a set of completed (habitId, date) for fast lookup
    const completedSet = new Set(
      userCompletions.map((c) => `${c.habitId}_${c.date}`),
    );

    // For streak calculation, fetch ALL completions per habit (up to `to` date)
    const allCompletions = await db
      .select()
      .from(completions)
      .where(
        and(
          eq(completions.userId, user.id),
          lte(completions.date, to),
        ),
      );

    // Group completions by habitId as sorted date sets
    const completionsByHabit = new Map<string, Set<string>>();
    for (const c of allCompletions) {
      if (!completionsByHabit.has(c.habitId)) {
        completionsByHabit.set(c.habitId, new Set());
      }
      completionsByHabit.get(c.habitId)!.add(c.date);
    }

    // Calculate streak at a given date for a habit
    function streakAtDate(habitId: string, dateStr: string): number {
      const dates = completionsByHabit.get(habitId);
      if (!dates) return 0;

      let streak = 0;
      const d = new Date(dateStr + 'T00:00:00');

      // If the date itself isn't completed, streak is 0
      if (!dates.has(dateStr)) return 0;

      // Walk backwards from dateStr counting consecutive days
      while (true) {
        const key = d.toISOString().slice(0, 10);
        if (dates.has(key)) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    }

    // Build habit name lookup
    const habitMap = new Map(userHabits.map((h) => [h.id, h.name]));

    // Generate CSV rows for every habit × every date in the range
    const rows: string[] = ['Date,Habit Name,Completed,Streak'];

    const startDate = new Date(from + 'T00:00:00');
    const endDate = new Date(to + 'T00:00:00');

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      for (const habit of userHabits) {
        const completed = completedSet.has(`${habit.id}_${dateStr}`);
        const streak = completed ? streakAtDate(habit.id, dateStr) : 0;
        // Escape habit name in case it contains commas
        const safeName = habit.name.includes(',')
          ? `"${habit.name}"`
          : habit.name;
        rows.push(`${dateStr},${safeName},${completed ? 'Yes' : 'No'},${streak}`);
      }
    }

    return new Response(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="redefine-export-${from}-to-${to}.csv"`,
      },
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
