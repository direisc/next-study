"use client"

import { verifyPasswordReset2FAWithTOTPAction } from "./actions"
import { useActionState } from "react"

const initialPasswordResetTOTPState = {
  message: "",
}

export function PasswordResetTOTPForm() {
  const [state, action] = useActionState(
    verifyPasswordReset2FAWithTOTPAction,
    initialPasswordResetTOTPState
  )
  return (
    <form action={action}>
      <label htmlFor="form-totp.code">Code</label>
      <input id="form-totp.code" name="code" required />
      <br />
      <button>Verify</button>
      <p>{state.message}</p>
    </form>
  )
}
