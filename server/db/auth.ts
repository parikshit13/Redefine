import { db } from './index';
import { users } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Extract the Clerk user ID from a JWT Bearer token.
 * Decodes the payload without cryptographic verification —
 * for production use @clerk/backend verifyToken() instead.
 */
function decodeClerkId(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

/**
 * Given a Request, extract the Bearer token, decode the Clerk user ID,
 * and look up the corresponding user row. Returns null if anything fails.
 */
export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const clerkId = decodeClerkId(token);
  if (!clerkId) return null;

  const rows = await db.select().from(users).where(eq(users.clerkId, clerkId));
  return rows[0] ?? null;
}
