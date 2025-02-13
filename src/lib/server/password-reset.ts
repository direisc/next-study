"use server"

import { db } from "./db"
import { encodeHexLowerCase } from "@oslojs/encoding"
import { generateRandomOTP } from "./utils"
import { sha256 } from "@oslojs/crypto/sha2"
import { cookies } from "next/headers"
import { cache } from "react"

import type { User } from "./user"

export async function createPasswordResetSession(
  token: string,
  userId: number,
  email: string
): Promise<PasswordResetSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const session: PasswordResetSession = {
    id: sessionId,
    userId,
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    code: generateRandomOTP(),
    emailVerified: false,
    twoFactorVerified: false,
  }
  db.execute(
    "INSERT INTO password_reset_session (id, user_id, email, code, expires_at) VALUES (?, ?, ?, ?, ?)",
    [
      session.id,
      session.userId,
      session.email,
      session.code,
      Math.floor(session.expiresAt.getTime() / 1000),
    ]
  )
  return session
}

export async function validatePasswordResetSessionToken(
  token: string
): Promise<PasswordResetSessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))
  const row = db.queryOne(
    `SELECT password_reset_session.id, password_reset_session.user_id, password_reset_session.email, password_reset_session.code, password_reset_session.expires_at, password_reset_session.email_verified, password_reset_session.two_factor_verified,
user.id, user.email, user.username, user.email_verified, IIF(totp_credential.id IS NOT NULL, 1, 0), IIF(passkey_credential.id IS NOT NULL, 1, 0), IIF(security_key_credential.id IS NOT NULL, 1, 0) FROM password_reset_session
INNER JOIN user ON password_reset_session.user_id = user.id
LEFT JOIN totp_credential ON user.id = totp_credential.user_id
LEFT JOIN passkey_credential ON user.id = passkey_credential.user_id
LEFT JOIN security_key_credential ON user.id = security_key_credential.user_id
WHERE password_reset_session.id = ?`,
    [sessionId]
  )
  if (row === null) {
    return { session: null, user: null }
  }
  const session: PasswordResetSession = {
    id: row.string(0),
    userId: row.number(1),
    email: row.string(2),
    code: row.string(3),
    expiresAt: new Date(row.number(4) * 1000),
    emailVerified: Boolean(row.number(5)),
    twoFactorVerified: Boolean(row.number(6)),
  }
  const user: User = {
    id: row.number(7),
    email: row.string(8),
    username: row.string(9),
    emailVerified: Boolean(row.number(10)),
    registeredTOTP: Boolean(row.number(11)),
    registeredPasskey: Boolean(row.number(12)),
    registeredSecurityKey: Boolean(row.number(13)),
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
    db.execute("DELETE FROM password_reset_session WHERE id = ?", [session.id])
    return { session: null, user: null }
  }
  return { session, user }
}

export async function setPasswordResetSessionAsEmailVerified(
  sessionId: string
): Promise<void> {
  db.execute(
    "UPDATE password_reset_session SET email_verified = 1 WHERE id = ?",
    [sessionId]
  )
}

export async function setPasswordResetSessionAs2FAVerified(
  sessionId: string
): Promise<void> {
  db.execute(
    "UPDATE password_reset_session SET two_factor_verified = 1 WHERE id = ?",
    [sessionId]
  )
}

export async function invalidateUserPasswordResetSessions(
  userId: number
): Promise<void> {
  db.execute("DELETE FROM password_reset_session WHERE user_id = ?", [userId])
}

export const getCurrentPasswordResetSession = cache(async () => {
  const cookiesHandler = await cookies()
  const token = cookiesHandler.get("password_reset_session")?.value ?? null
  if (token === null) {
    return { session: null, user: null }
  }
  const result = await validatePasswordResetSessionToken(token)
  if (result.session === null) {
    deletePasswordResetSessionTokenCookie()
  }
  return result
})

export async function setPasswordResetSessionTokenCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookiesHandler = await cookies()
  cookiesHandler.set("password_reset_session", token, {
    expires: expiresAt,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function deletePasswordResetSessionTokenCookie(): Promise<void> {
  const cookiesHandler = await cookies()
  cookiesHandler.set("password_reset_session", "", {
    maxAge: 0,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function sendPasswordResetEmail(
  email: string,
  code: string
): Promise<void> {
  console.log(`

---
To ${email}: Your reset code is ${code}
---

    `)
}

export interface PasswordResetSession {
  id: string
  userId: number
  email: string
  expiresAt: Date
  code: string
  emailVerified: boolean
  twoFactorVerified: boolean
}

export type PasswordResetSessionValidationResult =
  | { session: PasswordResetSession; user: User }
  | { session: null; user: null }
