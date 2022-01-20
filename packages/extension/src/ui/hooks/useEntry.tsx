import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useGlobalState } from "../states/global"
import { determineEntry } from "../utils/entry"

export const useEntry = () => {
  const navigate = useNavigate()
  const { isFirstRender } = useGlobalState()

  useEffect(() => {
    ;(async () => {
      if (!isFirstRender) {
        return
      }
      const entry = await determineEntry()
      useGlobalState.setState({ showLoading: false, isFirstRender: false })
      if (entry) {
        navigate(entry)
      } else {
        // TODO: handle error case
      }
    })()
  }, [navigate])
}
