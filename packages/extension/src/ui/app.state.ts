import { useEffect, useState } from "react"
import { create } from "zustand"

import { messageStream } from "../shared/messages"

interface State {
  error?: string
  isLoading: boolean
}

/**
 * @deprecated use Suspense for component loading states
 */
export const useLegacyAppState = create<State>()(() => ({
  isLoading: true,
}))

/**
 * @deprecated use Suspense for component loading states
 */
export const useLegacyLoadingProgress = () => {
  const [progress, setProgress] = useState<number>()

  useEffect(() => {
    messageStream.subscribe(([message]) => {
      if (message.type === "LOADING_PROGRESS") {
        setProgress(message.data >= 1 ? undefined : message.data)
      }
    })
  }, [])

  return { progress, clearProgress: () => setProgress(undefined) }
}
