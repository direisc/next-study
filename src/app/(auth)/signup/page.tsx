import { redirect } from "next/navigation"
import { SignupForm } from "./components"
import { get2FARedirect } from "@/lib/server/2fa"
import { getCurrentSession } from "@/lib/server/session"
import { globalGETRateLimit } from "@/lib/server/request"

export default async function SignUpPage() {
  if (!globalGETRateLimit()) {
    return "Too many requests"
  }

  const { session, user } = await getCurrentSession()
  if (session !== null) {
    if (!user.emailVerified) {
      return redirect("/verify-email")
    }
    if (!user.registered2FA) {
      return redirect("/2fa/setup")
    }
    if (!session.twoFactorVerified) {
      return redirect(get2FARedirect(user))
    }
    return redirect("/")
  }

  return <SignupForm />
}
