import { redirect } from "next/navigation"

import { get2FARedirect } from "@/lib/server/2fa"
import { globalGETRateLimit } from "@/lib/server/request"
import { getCurrentSession } from "@/lib/server/session"
import { getUserRecoverCode } from "@/lib/server/user"
import {
  getUserPasskeyCredentials,
  getUserSecurityKeyCredentials,
} from "@/lib/server/webauthn"

import {
  DisconnectTOTPButton,
  PasskeyCredentialListItem,
  RecoveryCodeSection,
  SecurityKeyCredentialListItem,
  UpdateEmailForm,
  UpdatePasswordForm,
} from "./components"
import { AuthCard } from "../components"
import Link from "next/link"
import { encodeBase64 } from "@oslojs/encoding"
import { Button } from "../../../components/ui/button"

export default async function Page() {
  if (!globalGETRateLimit()) {
    return "Too many requests"
  }

  const { session, user } = await getCurrentSession()
  if (session === null) {
    return redirect("/login")
  }
  if (user.registered2FA && !session.twoFactorVerified) {
    return redirect(get2FARedirect(user))
  }
  let recoveryCode: string | null = null
  if (user.registered2FA) {
    recoveryCode = getUserRecoverCode(user.id)
  }
  const passkeyCredentials = getUserPasskeyCredentials(user.id)
  const securityKeyCredentials = getUserSecurityKeyCredentials(user.id)
  return (
    <AuthCard title="Settings">
      <main className="grid gap-6">
        <section className="grid gap-6">
          <h2 className="font-semibold leading-none tracking-tight text-xl">
            Update email
          </h2>
          <p>Your email: {user.email}</p>
          <UpdateEmailForm />
        </section>
        <section className="grid gap-6">
          <h2 className="font-semibold leading-none tracking-tight text-xl">
            Update password
          </h2>
          <UpdatePasswordForm />
        </section>
        <section className="grid gap-6">
          <h2 className="font-semibold leading-none tracking-tight text-xl">
            Authenticator app
          </h2>
          {user.registeredTOTP ? (
            <>
              <Link href="/2fa/totp/setup">
                <Button className="w-full">Update TOTP</Button>
              </Link>
              <DisconnectTOTPButton />
            </>
          ) : (
            <Link href="/2fa/totp/setup">
              <Button className="w-full">Set up TOTP</Button>
            </Link>
          )}
        </section>
        <section className="grid gap-6">
          <h2 className="font-semibold leading-none tracking-tight text-xl">
            Passkeys
          </h2>
          <p>
            Passkeys are WebAuthn credentials that validate your identity using
            your device.
          </p>
          <ul className="list-inside list-disc">
            {passkeyCredentials.map((credential) => {
              return (
                <PasskeyCredentialListItem
                  encodedId={encodeBase64(credential.id)}
                  name={credential.name}
                  key={encodeBase64(credential.id)}
                />
              )
            })}
          </ul>
          <Link href="/2fa/passkey/register">
            <Button className="w-full">Add</Button>
          </Link>
        </section>
        <section className="grid gap-6">
          <h2 className="font-semibold leading-none tracking-tight text-xl">
            Security keys
          </h2>
          <p>
            Security keys are WebAuthn credentials that can only be used for
            two-factor authentication.
          </p>
          <ul>
            {securityKeyCredentials.map((credential) => {
              return (
                <SecurityKeyCredentialListItem
                  encodedId={encodeBase64(credential.id)}
                  name={credential.name}
                  key={encodeBase64(credential.id)}
                />
              )
            })}
          </ul>
          <Link href="/2fa/security-key/register">
            <Button className="w-full">Add</Button>
          </Link>
        </section>
        {recoveryCode && <RecoveryCodeSection recoveryCode={recoveryCode} />}
      </main>
    </AuthCard>
  )
}
