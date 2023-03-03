import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import {
  messageStream,
  sendMessage,
  waitForMessage,
} from "../../shared/messages"
import { IS_DEV } from "../../shared/utils/dev"
import { routes } from "../routes"

export const getMessagingPublicKey = async () => {
  sendMessage({ type: "GET_MESSAGING_PUBLIC_KEY" })
  return waitForMessage("GET_MESSAGING_PUBLIC_KEY_RES")
}

export const useResetAll = () => {
  const navigate = useNavigate()
  return useCallback(
    (initiatedByUI = false) => {
      if (initiatedByUI) {
        sendMessage({ type: "RESET_ALL" })
      }
      localStorage.clear()
      navigate(routes.onboardingStart(), { replace: true })
    },
    [navigate],
  )
}

if (IS_DEV) {
  messageStream.subscribe(([message]) => {
    console.log("Received message", message)
  })
  require("../features/dev/hotReload")
}
