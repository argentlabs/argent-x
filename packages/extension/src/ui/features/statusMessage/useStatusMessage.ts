import {
  ARGENT_X_STATUS_ENABLED,
  ARGENT_X_STATUS_URL,
} from "../../../shared/api/constants"
import {
  ISettingsStorage,
  isPrivacySettingsEnabled,
  settingsStorage,
} from "../../../shared/settings"
import { statusMessageStore } from "../../../shared/statusMessage/storage"
import { IStatusMessage } from "../../../shared/statusMessage/types"
import {
  useKeyValueStorage,
  useObjectStorage,
} from "../../../shared/storage/hooks"
import { useConditionallyEnabledSWR, withPolling } from "../../services/swr"
import { useArgentApiFetcher } from "../../services/useArgentApiFetcher"

export const useLastDismissedMessageId = () =>
  useKeyValueStorage(statusMessageStore, "lastDismissedMessageId")

export const useLastFullScreenMessageClosedId = () =>
  useKeyValueStorage(statusMessageStore, "lastFullScreenMessageClosedId")

export const useStatusMessageEnabled = () => {
  const { privacyUseArgentServices } =
    useObjectStorage<ISettingsStorage>(settingsStorage)
  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_X_STATUS_ENABLED
  }
  return ARGENT_X_STATUS_ENABLED && privacyUseArgentServices
}

export const useStatusMessage = () => {
  const fetcher = useArgentApiFetcher()
  const statusMessageEnabled = useStatusMessageEnabled()
  const { data: statusMessage } = useConditionallyEnabledSWR<IStatusMessage>(
    statusMessageEnabled,
    ARGENT_X_STATUS_URL,
    fetcher,
    withPolling(5 * 60 * 60 * 1000) /** 5 minutes */,
  )
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
