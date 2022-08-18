import { useMemo } from "react"

import { getShouldShowMessage } from "./statusMessageVisibility"
import { useLastDismissedMessageId, useStatusMessage } from "./useStatusMessage"

export const useShouldShowStatusMessage = () => {
  const statusMessage = useStatusMessage()
  const lastDismissedMessageId = useLastDismissedMessageId()
  return useMemo(() => {
    if (!statusMessage) {
      return false
    }
    const shouldShowMessage = getShouldShowMessage({
      statusMessage,
      lastDismissedMessageId,
    })
    return shouldShowMessage
  }, [lastDismissedMessageId, statusMessage])
}
