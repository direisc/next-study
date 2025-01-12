import { hmac } from "@oslojs/crypto/hmac"
import { SHA256 } from "@oslojs/crypto/sha2"
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding"
import {
  JWSRegisteredHeaders,
  JWTRegisteredClaims,
  createJWTSignatureMessage,
  encodeJWT,
  joseAlgorithmHS256,
  parseJWT,
} from "@oslojs/jwt"

// TODO replace it
const SIGNATURE_KEY = "qualquerChaveMuitoGrande"

export const EXPIRE_ACCESS_MS = 5 * 60 * 1000
export const EXPIRE_REFRESH_MS = 12 * 1 * 60 * 1000

export type AudienceFlow = "refresh" | "verify-email" | "2fa" | "authenticated"

export type Payload = {
  iss?: string // Issuer - StringOrURI
  sub: string // Subject - StringOrURI
  aud?: AudienceFlow // Audience - StringOrURI
  exp: number // Expiration Time - NumericDate (1516239022)
  nbf?: number // Not Before - NumericDate (1516239022)
  iat?: number // Issued At - NumericDate (1516239022)
  jti?: string // JWT ID - String
  [key: string]: unknown
}

const HEADER_JSON = '{"alg":"HS256","typ":"JWT"}'

export function encodeToken(
  payload: Payload,
  key = SIGNATURE_KEY
): EncodeTokenResponse {
  const NOW = Date.now()

  payload.jti = generateJTI()
  payload.exp = payload.exp || Math.round((NOW + EXPIRE_ACCESS_MS) / 1000)
  payload.aud = payload.aud || "authenticated"

  const payloadJSON = JSON.stringify(payload)
  const token = encodeJWT(
    HEADER_JSON,
    payloadJSON,
    genSignature(createJWTSignatureMessage(HEADER_JSON, payloadJSON), key)
  )

  return {
    token,
    payload,
  }
}

export function verifyToken(
  token: string,
  expectedAudience?: AudienceFlow
): Payload {
  const [header, payload] = parseJWT(token) as unknown as [object, Payload]
  const headerParameters = new JWSRegisteredHeaders(header)
  if (headerParameters.algorithm() !== joseAlgorithmHS256) {
    throw new Error("Unsupported algorithm")
  }

  const claims = new JWTRegisteredClaims(payload)

  if (!claims.verifyExpiration()) {
    throw new Error("Expired token")
  }

  if (claims.hasNotBefore() && !claims.verifyNotBefore()) {
    throw new Error("Invalid token")
  }

  if (expectedAudience && payload.aud !== expectedAudience) {
    throw new Error("Unexpected Audience")
  }

  return payload
}

type EncodeTokenResponse = {
  token: string
  payload: Payload
}

function generateJTI(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCaseNoPadding(bytes)
}

function genSignature(message: Uint8Array, signatureKey: string) {
  const key = Buffer.from(signatureKey)
  return hmac(SHA256, key, message)
}
