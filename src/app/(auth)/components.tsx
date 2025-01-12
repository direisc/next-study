"use client"

import { useActionState } from "react"
import { logoutAction } from "./actions"

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
