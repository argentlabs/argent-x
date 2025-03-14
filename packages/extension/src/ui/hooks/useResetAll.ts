import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { sendMessage } from "../../shared/messages/messages"
import { routes } from "../../shared/ui/routes"
import { argentDb } from "../../shared/idb/argentDb"

export const useResetAll = () => {
  const navigate = useNavigate()
  return useCallback(
    (initiatedByUI = false) => {
      if (initiatedByUI) {
        void sendMessage({ type: "RESET_ALL" })
      }
      localStorage.clear()
      void argentDb.clear()
      navigate(routes.onboardingStart(), { replace: true })
    },
    [navigate],
  )
}
