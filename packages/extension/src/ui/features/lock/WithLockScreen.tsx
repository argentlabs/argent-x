import { Outlet } from "react-router-dom"
import { PropsWithChildren } from "react"

import { useIsLocked } from "../../hooks/appState"
import { LockScreen } from "./LockScreen"

export function WithLockScreen({ children }: PropsWithChildren) {
  const isLocked = useIsLocked()
  if (isLocked) {
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
