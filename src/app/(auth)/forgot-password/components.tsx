"use client"

import { forgotPasswordAction } from "./actions"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AuthCard } from "@/components/auth-card"

const initialForgotPasswordState = {
  message: "",
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(
    forgotPasswordAction,
    initialForgotPasswordState
  )

  return (
    <AuthCard
      title="Forgot your password?"
      description="Provide you email to receive instructions."
    >
      <form action={action}>
        <div className="grid gap-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send
            </Button>
            <p>{state.message}</p>
          </div>
          <div className="text-center text-sm">
            Have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </form>
    </AuthCard>
  )
}
