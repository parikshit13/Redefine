import { db } from '../../../server/db';
import { habits } from '../../../server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUserFromRequest } from '../../../server/db/auth';
import type { ExpoRequest } from 'expo-router/server';

export async function PUT(request: ExpoRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = params;

    const [updated] = await db
      .update(habits)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning();

    if (!updated) {
      return Response.json({ error: 'Habit not found' }, { status: 404 });
    }

    return Response.json(updated);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: ExpoRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Soft delete — set isArchived = true
    const [archived] = await db
      .update(habits)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
      .returning();

    if (!archived) {
      return Response.json({ error: 'Habit not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
