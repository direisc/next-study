import { redirect } from "next/navigation"
import { globalGETRateLimit } from "@/lib/server/request"
import { getCurrentSession } from "@/lib/server/session"
import { get2FARedirect } from "@/lib/server/2fa"

export default async function Home() {
  if (!globalGETRateLimit()) {
    return "Too many requests"
  }

  const { session, user } = await getCurrentSession()
  if (session === null) {
    return redirect("/login")
  }
  if (!user.emailVerified) {
    return redirect("/verify-email")
  }
  if (!user.registered2FA) {
    return redirect("/2fa/setup")
  }
  if (!session.twoFactorVerified) {
    return redirect(get2FARedirect(user))
  }

  redirect("/app/dashboard")
}
