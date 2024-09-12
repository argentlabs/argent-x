import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../shared/ui/routes"
import { sessionService } from "./session"

export const useStopSession = () => {
  const navigate = useNavigate()
  return useCallback(
    async (initiatedByUI = false) => {
      if (initiatedByUI) {
        await sessionService.stopSession()
      }
      navigate(routes.accountTokens(), { replace: true })
    },
    [navigate],
  )
}
