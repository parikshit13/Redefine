import { db } from '../../../server/db';
import { users } from '../../../server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { clerkId, name, email } = await request.json();

    if (!clerkId || !name || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert — create if not exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));

    if (existing.length === 0) {
      const [user] = await db
        .insert(users)
        .values({ clerkId, name, email })
        .returning();
      return Response.json(user);
    }

    return Response.json(existing[0]);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
