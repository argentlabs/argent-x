import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { sendMessage } from "../../shared/messages"
import { routes } from "../routes"

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
