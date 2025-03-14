import { Outlet } from "react-router-dom"
import type { PropsWithChildren } from "react"

import { LockScreen } from "./LockScreen"
import { useKeyValueStorage } from "../../hooks/useStorage"
import { sessionStore } from "../../../shared/session/storage"

export function WithLockScreen({ children }: PropsWithChildren) {
  const isUnlocked = useKeyValueStorage(sessionStore, "isUnlocked")

  if (!isUnlocked) {
    return <LockScreen position="absolute" inset={0} />
  }
  return <>{children}</>
}

export function RouteWithLockScreen() {
  return (
    <WithLockScreen>
      <Outlet />
    </WithLockScreen>
  )
}
