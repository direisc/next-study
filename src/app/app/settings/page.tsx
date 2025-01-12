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
import Link from "next/link"
import { encodeBase64 } from "@oslojs/encoding"
import { Button } from "@/components/ui/button"
import { AuthCard } from "@/components/auth-card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <AuthCard title="Update email">
            <p>Your email: {user.email}</p>
            <UpdateEmailForm />
          </AuthCard>

          <AuthCard title="Update password">
            <UpdatePasswordForm />
          </AuthCard>

          <AuthCard title="Authenticator app">
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
          </AuthCard>

          <AuthCard title="Passkeys">
            <p>
              Passkeys are WebAuthn credentials that validate your identity
              using your device.
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
          </AuthCard>

          <AuthCard title="Security keys">
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
          </AuthCard>

          {recoveryCode && <RecoveryCodeSection recoveryCode={recoveryCode} />}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
          .
        </div>
      </div>
    </>
  )
}
