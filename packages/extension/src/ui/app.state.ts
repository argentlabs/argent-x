import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import create from "zustand"

import { messageStream } from "../shared/messages"
import { defaultNetwork } from "../shared/network"
import { routes } from "./routes"

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

export const useLoadingProgress = () => {
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

/** when session is stopped, make all tabs navigate to lock screen */

export const useStopSessionHandler = () => {
  const navigate = useNavigate()
  useEffect(() => {
    messageStream.subscribe(([message]) => {
      if (message.type === "STOP_SESSION") {
        navigate(routes.lockScreen())
      }
    })
  }, [navigate])
}
