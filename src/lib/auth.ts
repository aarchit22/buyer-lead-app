import { cookies } from 'next/headers';
import { verify, sign } from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export type SessionUser = { username: string };

const COOKIE_NAME = 'session';

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as SessionUser & { exp?: number };
    return { username: decoded.username };
  } catch (e) {
    console.warn('Invalid session token', e);
    return null;
  }
}

// Throws redirect if not logged in, returns user otherwise
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

// Helper to create token (used in login action)
export function createSession(user: SessionUser): string {
  return sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });
}
