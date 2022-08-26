import { useMemo } from "react"

import {
  ARGENT_X_STATUS_ENABLED,
  ARGENT_X_STATUS_URL,
} from "../../../shared/api/constants"
import {
  isPrivacySettingsEnabled,
  settingsStore,
} from "../../../shared/settings"
import { statusMessageStore } from "../../../shared/statusMessage/storage"
import { IStatusMessage } from "../../../shared/statusMessage/types"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { argentApiFetcher } from "../../services/argentApiFetcher"
import { useConditionallyEnabledSWR, withPolling } from "../../services/swr"
import { getMessageForVersion } from "./statusMessageVisibility"

export const useLastDismissedMessageId = () =>
  useKeyValueStorage(statusMessageStore, "lastDismissedMessageId")

export const useLastFullScreenMessageClosedId = () =>
  useKeyValueStorage(statusMessageStore, "lastFullScreenMessageClosedId")

export const useStatusMessageEnabled = () => {
  const privacyUseArgentServices = useKeyValueStorage(
    settingsStore,
    "privacyUseArgentServices",
  )
  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_X_STATUS_ENABLED
  }
  return ARGENT_X_STATUS_ENABLED && privacyUseArgentServices
}

export const useStatusMessage = () => {
  const statusMessageEnabled = useStatusMessageEnabled()
  const { data } = useConditionallyEnabledSWR<
    IStatusMessage | IStatusMessage[]
  >(
    statusMessageEnabled,
    ARGENT_X_STATUS_URL,
    argentApiFetcher,
    withPolling(5 * 60 * 60 * 1000) /** 5 minutes */,
  )
  const statusMessage = useMemo(() => {
    return getMessageForVersion({ statusMessage: data })
  }, [data])
  return statusMessage
}

// Uncomment the functions below to test messages locally

// import statusMessages from "@argent-x/storybook/src/features/statusMessage/__fixtures__/status-messages.json"

// export const useStatusMessageEnabled = () => {
//   return true
// }

// export const useStatusMessage = () => {
//   return statusMessages.danger as IStatusMessage
//   return statusMessages.warn as IStatusMessage
//   return statusMessages.info as IStatusMessage
// }
