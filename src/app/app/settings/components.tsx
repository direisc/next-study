"use client"

import { useActionState, useState } from "react"
import {
  deletePasskeyAction,
  deleteSecurityKeyAction,
  disconnectTOTPAction,
  regenerateRecoveryCodeAction,
  updateEmailAction,
  updatePasswordAction,
} from "./actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AuthCard } from '@/components/auth-card'

const initialUpdatePasswordState = {
  message: "",
}

export function UpdatePasswordForm() {
  const [state, action] = useActionState(
    updatePasswordAction,
    initialUpdatePasswordState
  )

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="form-password.password">Current password</Label>
        <Input
          type="password"
          id="form-email.password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="form-password.new-password">New password</Label>
        <Input
          type="password"
          id="form-password.new-password"
          name="new_password"
          autoComplete="new-password"
          required
        />
      </div>
      <Button className="w-full">Update</Button>
      <p>{state.message}</p>
    </form>
  )
}

const initialUpdateFormState = {
  message: "",
}

export function UpdateEmailForm() {
  const [state, action] = useActionState(
    updateEmailAction,
    initialUpdateFormState
  )

  return (
    <form action={action} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="form-email.email">New email</Label>
        <Input type="email" id="form-email.email" name="email" required />
      </div>
      <Button className="w-full">Update</Button>
      <p>{state.message}</p>
    </form>
  )
}

const initialDisconnectTOTPState = {
  message: "",
}

export function DisconnectTOTPButton() {
  const [state, formAction] = useActionState(
    disconnectTOTPAction,
    initialDisconnectTOTPState
  )
  return (
    <form action={formAction} className="grid gap-6">
      <Button className="w-full">Disconnect</Button>
      <p>{state.message}</p>
    </form>
  )
}

const initialPasskeyState = {
  message: "",
}

export function PasskeyCredentialListItem(props: {
  encodedId: string
  name: string
}) {
  const [state, formAction] = useActionState(
    deletePasskeyAction,
    initialPasskeyState
  )
  return (
    <li>
      {props.name}
      <form action={formAction} className="grid gap-6">
        <input type="hidden" name="credential_id" value={props.encodedId} />
        <Button className="w-full" variant="destructive">
          Delete
        </Button>
        <p>{state.message}</p>
      </form>
    </li>
  )
}

const initialSecurityKeyState = {
  message: "",
}

export function SecurityKeyCredentialListItem(props: {
  encodedId: string
  name: string
}) {
  const [state, formAction] = useActionState(
    deleteSecurityKeyAction,
    initialSecurityKeyState
  )
  return (
    <li>
      <p>{props.name}</p>
      <form action={formAction} className="grid gap-6">
        <input type="hidden" name="credential_id" value={props.encodedId} />
        <Button className="w-full" variant="destructive">
          Delete
        </Button>
        <p>{state.message}</p>
      </form>
    </li>
  )
}

export function RecoveryCodeSection(props: { recoveryCode: string }) {
  const [recoveryCode, setRecoveryCode] = useState(props.recoveryCode)
  return (
    <AuthCard title='Recovery code' description={`Your recovery code is: ${recoveryCode}`}>
      <Button
        className="w-full"
        onClick={async () => {
          const result = await regenerateRecoveryCodeAction()
          if (result.recoveryCode !== null) {
            setRecoveryCode(result.recoveryCode)
          }
        }}
      >
        Generate new code
      </Button>
    </AuthCard>
  )
}
