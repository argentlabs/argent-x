import { FC, useCallback } from "react"

import { statusMessageStore } from "../../../shared/statusMessage/storage"
import { useShouldShowStatusMessage } from "./useShouldShowStatusMessage"
import { useStatusMessage } from "./useStatusMessage"
import { StatusMessageBanner } from "./StatusMessageBanner"

export const StatusMessageBannerContainer: FC = () => {
  const shouldShowStatusMessage = useShouldShowStatusMessage()
  const statusMessage = useStatusMessage()
  const onDismiss = useCallback(async () => {
    await statusMessageStore.set("lastDismissedMessageId", statusMessage?.id)
  }, [statusMessage?.id])
  if (!shouldShowStatusMessage) {
    return null
  }
  return (
    <StatusMessageBanner statusMessage={statusMessage} onDismiss={onDismiss} />
  )
}
