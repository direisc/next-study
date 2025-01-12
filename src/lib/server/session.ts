import { db } from "./db"
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { cookies } from "next/headers"
import { cache } from "react"

import type { User } from "./user"

export function validateSessionToken(token: string): SessionValidationResult {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const row = db.queryOne(
    `
SELECT session.id, session.user_id, session.expires_at, session.two_factor_verified, user.id, user.email, user.username, user.email_verified, IIF(totp_credential.id IS NOT NULL, 1, 0), IIF(passkey_credential.id IS NOT NULL, 1, 0), IIF(security_key_credential.id IS NOT NULL, 1, 0) FROM session
INNER JOIN user ON session.user_id = user.id
LEFT JOIN totp_credential ON session.user_id = totp_credential.user_id
LEFT JOIN passkey_credential ON user.id = passkey_credential.user_id
LEFT JOIN security_key_credential ON user.id = security_key_credential.user_id
WHERE session.id = ?
`,
    [sessionId]
  )

  if (row === null) {
    return { session: null, user: null }
  }
  const session: Session = {
    id: row.string(0),
    userId: row.number(1),
    expiresAt: new Date(row.number(2) * 1000),
    twoFactorVerified: Boolean(row.number(3)),
  }
  const user: User = {
    id: row.number(4),
    email: row.string(5),
    username: row.string(6),
    emailVerified: Boolean(row.number(7)),
    registeredTOTP: Boolean(row.number(8)),
    registeredPasskey: Boolean(row.number(9)),
    registeredSecurityKey: Boolean(row.number(10)),
    registered2FA: false,
  }
  if (
    user.registeredPasskey ||
    user.registeredSecurityKey ||
    user.registeredTOTP
  ) {
    user.registered2FA = true
  }
  if (Date.now() >= session.expiresAt.getTime()) {
    db.execute("DELETE FROM session WHERE id = ?", [sessionId])
    return { session: null, user: null }
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    db.execute("UPDATE session SET expires_at = ? WHERE session.id = ?", [
      Math.floor(session.expiresAt.getTime() / 1000),
      sessionId,
    ])
  }
  return { session, user }
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const cookiesHandler = await cookies()
    const token = cookiesHandler.get("session")?.value ?? null
    if (token === null) {
      return { session: null, user: null }
    }
    const result = validateSessionToken(token)
    return result
  }
)

export function invalidateSession(sessionId: string): void {
  db.execute("DELETE FROM session WHERE id = ?", [sessionId])
}

export function invalidateUserSessions(userId: number): void {
  db.execute("DELETE FROM session WHERE user_id = ?", [userId])
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookiesHandler = await cookies()
  cookiesHandler.set("session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookiesHandler = await cookies()
  cookiesHandler.set("session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  })
}

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20)
  crypto.getRandomValues(tokenBytes)
  const token = encodeBase32LowerCaseNoPadding(tokenBytes)
  return token
}

export function createSession(
  token: string,
  userId: number,
  flags: SessionFlags
): Session {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    twoFactorVerified: flags.twoFactorVerified,
  }
  db.execute(
    "INSERT INTO session (id, user_id, expires_at, two_factor_verified) VALUES (?, ?, ?, ?)",
    [
      session.id,
      session.userId,
      Math.floor(session.expiresAt.getTime() / 1000),
      Number(session.twoFactorVerified),
    ]
  )
  return session
}

export function setSessionAs2FAVerified(sessionId: string): void {
  db.execute("UPDATE session SET two_factor_verified = 1 WHERE id = ?", [
    sessionId,
  ])
}

export interface SessionFlags {
  twoFactorVerified: boolean
}

export interface Session extends SessionFlags {
  id: string
  expiresAt: Date
  userId: number
}

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null }
