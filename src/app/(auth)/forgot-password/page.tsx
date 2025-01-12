import { ForgotPasswordForm } from "./components"

import { globalGETRateLimit } from "@/lib/server/request"

export default function Page() {
  if (!globalGETRateLimit()) {
    return "Too many requests"
  }

  return <ForgotPasswordForm />
}
