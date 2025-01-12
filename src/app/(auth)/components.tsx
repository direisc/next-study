"use client"

import { useActionState } from "react"
import { logoutAction } from "./actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const initialState = {
  message: "",
}

export function LogoutButton({
  children = "Sign out",
}: {
  children?: React.ReactNode
}) {
  const [, action] = useActionState(logoutAction, initialState)
  return (
    <form action={action} className="w-full">
      <button className="w-full flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0">
        {children}
      </button>
    </form>
  )
}

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
