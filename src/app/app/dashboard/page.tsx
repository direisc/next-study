import { getCurrentSession } from "@/lib/server/session"
import { redirect } from "next/navigation"
import { get2FARedirect } from "@/lib/server/2fa"
import { globalGETRateLimit } from "@/lib/server/request"
import React from "react"
import { BreadcrumbApp } from "@/components/breadcrumb-app"

export default async function Page() {
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

  return (
    <>
      <BreadcrumbApp
        breadcrumb={[
          // {
          //   item: "Building Your Application",
          //   url: "#",
          // },
          {
            item: "Dashboard",
          },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  )
}
