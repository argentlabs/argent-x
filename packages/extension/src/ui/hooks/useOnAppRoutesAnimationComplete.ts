import { useEmitEvent } from "@argent/shared"
import { useCallback } from "react"

export const AppRoutesAnimationComplete = Symbol("AppRoutesAnimationComplete")

export type AppRoutesEvents = {
  [AppRoutesAnimationComplete]: never
}

export const useOnAppRoutesAnimationComplete = () => {
  const emitEvent = useEmitEvent<AppRoutesEvents>()
  const onAppRoutesAnimationComplete = useCallback(() => {
    /** Wait for next render after components have mounted and set up listener */
    setTimeout(() => void emitEvent(AppRoutesAnimationComplete), 0)
  }, [emitEvent])
  return onAppRoutesAnimationComplete
}
