import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { sendMessage, waitForMessage } from "../../shared/messages"
import { routes } from "../routes"
import { encryptForBackground } from "./crypto"

export const hasActiveSession = async () => {
  sendMessage({ type: "HAS_SESSION" })
  return waitForMessage("HAS_SESSION_RES")
}

export const isInitialized = async () => {
  sendMessage({ type: "IS_INITIALIZED" })
  return await waitForMessage("IS_INITIALIZED_RES")
}

export const startSession = async (password: string): Promise<void> => {
  const body = await encryptForBackground(password)

  sendMessage({ type: "START_SESSION", data: { secure: true, body } })

  const succeeded = await Promise.race([
    waitForMessage("START_SESSION_RES").then(() => true),
    waitForMessage("START_SESSION_REJ")
      .then(() => false)
      .catch(() => false),
  ])

  if (!succeeded) {
    throw Error("Wrong password")
  }
}

export const useStopSession = () => {
  const navigate = useNavigate()
  return useCallback(
    (initiatedByUI = false) => {
      if (initiatedByUI) {
        sendMessage({ type: "STOP_SESSION" })
      }
      navigate(routes.lockScreen(), { replace: true })
    },
    [navigate],
  )
}

export const checkPassword = async (password: string): Promise<boolean> => {
  const body = await encryptForBackground(password)

  sendMessage({ type: "CHECK_PASSWORD", data: { body } })

  return await Promise.race([
    waitForMessage("CHECK_PASSWORD_RES").then(() => true),
    waitForMessage("CHECK_PASSWORD_REJ")
      .then(() => false)
      .catch(() => false),
  ])
}
