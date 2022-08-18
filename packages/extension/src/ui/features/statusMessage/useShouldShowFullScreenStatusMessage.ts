import { useMemo } from "react"

import { getShouldShowMessage } from "./statusMessageVisibility"
import {
  useLastFullScreenMessageClosedId,
  useStatusMessage,
} from "./useStatusMessage"

export const useShouldShowFullScreenStatusMessage = () => {
  const statusMessage = useStatusMessage()
  const lastFullScreenMessageClosedId = useLastFullScreenMessageClosedId()
  return useMemo(() => {
    if (!statusMessage) {
      return false
    }
    if (!statusMessage.fullScreen) {
      return false
    }
    if (statusMessage.id === lastFullScreenMessageClosedId) {
      return false
    }
    const shouldShowMessage = getShouldShowMessage({
      statusMessage,
    })
    return shouldShowMessage
  }, [lastFullScreenMessageClosedId, statusMessage])
}
