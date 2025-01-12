"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signupAction } from "./actions"
import { useActionState } from "react"
import Link from "next/link"
import { AuthCard } from "@/components/auth-card"

const initialState = {
  message: "",
}

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialState)

  return (
    <AuthCard
      title="Sign Up"
      // description="Registry to use the platform."
    >
      <form action={action}>
        <div className="grid gap-6">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="username"
                placeholder="john"
                required
              />
            </div>
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
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
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
