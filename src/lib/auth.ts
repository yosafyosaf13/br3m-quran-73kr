import { cookies } from 'next/headers'
import { db } from '@/lib/db'

// In-memory session store - use globalThis to persist across HMR and route compilations
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, { userId: string; expiresAt: Date }> | undefined
  sessionCleanupTimer: ReturnType<typeof setInterval> | undefined
}

export const sessions = globalForSessions.sessions ?? new Map<string, { userId: string; expiresAt: Date }>()
globalForSessions.sessions = sessions

// Session duration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

// Cleanup interval: every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000

// Periodic cleanup of expired sessions to prevent memory leaks
function startSessionCleanup() {
  if (globalForSessions.sessionCleanupTimer) return // Already running

  globalForSessions.sessionCleanupTimer = setInterval(() => {
    const now = new Date()
    let cleanedCount = 0
    for (const [token, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(token)
        cleanedCount++
      }
    }
    if (cleanedCount > 0) {
      console.log(`[Auth] Cleaned up ${cleanedCount} expired session(s). Active sessions: ${sessions.size}`)
    }
  }, CLEANUP_INTERVAL_MS)

  // Prevent the timer from keeping the process alive
  if (globalForSessions.sessionCleanupTimer && typeof globalForSessions.sessionCleanupTimer === 'object' && 'unref' in globalForSessions.sessionCleanupTimer) {
    ;(globalForSessions.sessionCleanupTimer as ReturnType<typeof setInterval> & { unref: () => void }).unref()
  }
}

// Start cleanup on module load
startSessionCleanup()

export interface SessionUser {
  id: string
  name: string
  username: string
  role: string
  active: boolean
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  sessions.set(token, { userId, expiresAt })
  return token
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value

  if (!token) return null

  const session = sessions.get(token)
  if (!session) return null

  if (session.expiresAt < new Date()) {
    sessions.delete(token)
    return null
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, username: true, role: true, active: true },
  })

  if (!user || !user.active) return null

  return user
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session_token')?.value
  if (token) {
    sessions.delete(token)
  }
}

export function getSessionCookieOptions() {
  return {
    name: 'session_token' as const,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    },
  }
}
