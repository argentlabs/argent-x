import type { FC } from "react"
import { useCallback } from "react"

import { statusMessageStore } from "../../../shared/statusMessage/storage"
import { useStatusMessage } from "../statusMessage/useStatusMessage"
import { StatusMessageBanner } from "./StatusMessageBanner"
import { useShouldShowStatusMessage } from "../statusMessage/useShouldShowStatusMessage"
import { voidify } from "@argent/x-shared"

export const useShowStatusMessageBanner = () => {
  const shouldShowStatusMessage = useShouldShowStatusMessage()
  return shouldShowStatusMessage
}

export const StatusMessageBannerContainer: FC = () => {
  const statusMessage = useStatusMessage()
  const onClick = useCallback(() => {
    if (statusMessage?.linkUrl) {
      window.open(statusMessage.linkUrl, "_blank")?.focus()
    }
  }, [statusMessage?.linkUrl])
  const onDismiss = useCallback(async () => {
    await statusMessageStore.set("lastDismissedMessageId", statusMessage?.id)
  }, [statusMessage?.id])
  if (!statusMessage) {
    return null
  }
  return (
    <StatusMessageBanner
      statusMessage={statusMessage}
      onClick={onClick}
      onClose={voidify(onDismiss)}
    />
  )
}
