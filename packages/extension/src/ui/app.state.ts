import { useEffect, useState } from "react"
import create from "zustand"

import { messageStream } from "../shared/messages"
import { defaultNetwork } from "../shared/networks"

interface State {
  switcherNetworkId: string
  error?: string
  isLoading: boolean
  isFirstRender: boolean
}

export const useAppState = create<State>(() => ({
  switcherNetworkId: defaultNetwork.id,
  isLoading: true,
  isFirstRender: true,
}))

export const useLoadingProgress = (): number => {
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    messageStream.subscribe(([message]) => {
      if (message.type === "LOADING_PROGRESS") {
        setProgress(message.data)
      }
    })
  }, [])

  return progress
}
