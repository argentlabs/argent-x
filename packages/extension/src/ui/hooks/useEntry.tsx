import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAppState } from "../states/app"
import { determineEntry } from "../utils/entry"

export const useEntry = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useAppState()

  useEffect(() => {
    ;(async () => {
      if (!isFirstRender) {
        return
      }
      const entry = await determineEntry()
      useAppState.setState({ isLoading: false, isFirstRender: false })
      if (entry) {
        navigate(entry)
      } else {
        // TODO: handle error case
      }
    })()
  }, [navigate])
}
