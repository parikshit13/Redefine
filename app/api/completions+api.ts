import { db } from '../../server/db';
import { completions } from '../../server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { getUserFromRequest } from '../../server/db/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitId, date } = await request.json();

    if (!habitId || !date) {
      return Response.json({ error: 'habitId and date are required' }, { status: 400 });
    }

    // Check if completion already exists
    const existing = await db
      .select()
      .from(completions)
      .where(
        and(
          eq(completions.habitId, habitId),
          eq(completions.userId, user.id),
          eq(completions.date, date),
        ),
      );

    if (existing.length > 0) {
      // Un-complete: delete the existing completion
      await db
        .delete(completions)
        .where(eq(completions.id, existing[0].id));
      return Response.json({ completed: false });
    }

    // Complete: insert a new completion
    await db.insert(completions).values({
      habitId,
      userId: user.id,
      date,
    });

    return Response.json({ completed: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

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

    const rows = await db
      .select()
      .from(completions)
      .where(
        and(
          eq(completions.userId, user.id),
          gte(completions.date, from),
          lte(completions.date, to),
        ),
      );

    return Response.json(rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
