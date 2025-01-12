"use client"

import { verifyPasswordResetEmailAction } from "./actions"
import { useActionState } from "react"

const initialPasswordResetEmailVerificationState = {
  message: "",
}

export function PasswordResetEmailVerificationForm() {
  const [state, action] = useActionState(
    verifyPasswordResetEmailAction,
    initialPasswordResetEmailVerificationState
  )
  return (
    <form action={action}>
      <label htmlFor="form-verify.code">Code</label>
      <input id="form-verify.code" name="code" required />
      <button>verify</button>
      <p>{state.message}</p>
    </form>
  )
}
