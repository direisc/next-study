import {
  AudienceFlow,
  encodeToken,
  EXPIRE_ACCESS_MS,
  EXPIRE_REFRESH_MS,
  Payload,
} from "./jwt"

export interface Session {
  id: string
  userId: string
  expiresAt: Date
}

export interface User {
  id: string
}

function preparePayload({
  user,
  aud,
  exp = EXPIRE_ACCESS_MS,
}: {
  user: User
  aud: AudienceFlow
  exp?: number
}): Payload {
  const NOW = Date.now()

  const payload: Payload = {
    iat: Math.round(NOW / 1000),
    sub: String(user.id),
    exp: Math.round((NOW + exp) / 1000),
    aud,
  }

  return payload
}

export function createSession(user: User) {
  // TODO accessToken audience will require actual user classification to manage
  const payloadAccessToken = preparePayload({
    user,
    aud: "authenticated",
    exp: EXPIRE_ACCESS_MS,
  })
  const payloadRefreshToken = preparePayload({
    user,
    aud: "refresh",
    exp: EXPIRE_REFRESH_MS,
  })

  const accessToken = encodeToken(payloadAccessToken)
  const refreshToken = encodeToken(payloadRefreshToken)

  const session: Session = {
    id: payloadAccessToken.jti!,
    userId: user.id,
    expiresAt: new Date(payloadAccessToken.exp * 1000),
  }

  return { accessToken, refreshToken, session }
}
