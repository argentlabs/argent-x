import type { FC } from "react"
import { useCallback } from "react"

import { statusMessageStore } from "../../../shared/statusMessage/storage"
import { StatusMessageFullScreen } from "./StatusMessageFullScreen"
import { useStatusMessage } from "./useStatusMessage"

export const StatusMessageFullScreenContainer: FC = () => {
  const statusMessage = useStatusMessage()
  const onClose = useCallback(async () => {
    await statusMessageStore.set(
      "lastFullScreenMessageClosedId",
      statusMessage?.id,
    )
  }, [statusMessage?.id])
  return (
    <StatusMessageFullScreen
      statusMessage={statusMessage}
      onClose={() => void onClose()}
    />
  )
}
