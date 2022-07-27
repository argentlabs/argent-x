import { ARGENT_X_STATUS_URL } from "../../../shared/api/constants"
import { isPrivacySettingsEnabled } from "../../../shared/settings"
import { statusMessageStore } from "../../../shared/statusMessage/storage"
import { IStatusMessage } from "../../../shared/statusMessage/types"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { useConditionallyEnabledSWR } from "../../services/swr"
import { useArgentApiFetcher } from "../../services/useArgentApiFetcher"
import { useBackgroundSettingsValue } from "../../services/useBackgroundSettingsValue"

export const useLastDismissedMessageId = () =>
  useKeyValueStorage(statusMessageStore, "lastDismissedMessageId")

export const useLastFullScreenMessageClosedId = () =>
  useKeyValueStorage(statusMessageStore, "lastFullScreenMessageClosedId")

export const useStatusMessageEnabled = () => {
  const { value: privacyUseArgentServicesEnabled } = useBackgroundSettingsValue(
    "privacyUseArgentServices",
  )
  if (!isPrivacySettingsEnabled) {
    return false
  }
  return privacyUseArgentServicesEnabled
}

export const useStatusMessage = () => {
  const fetcher = useArgentApiFetcher()
  const statusMessageEnabled = useStatusMessageEnabled()
  const { data: statusMessage } = useConditionallyEnabledSWR<IStatusMessage>(
    statusMessageEnabled,
    ARGENT_X_STATUS_URL,
    fetcher,
    {
      refreshInterval: 5 * 60 * 60 * 1000 /** 5 minutes */,
    },
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
