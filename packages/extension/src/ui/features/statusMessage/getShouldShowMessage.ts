import semverGt from "semver/functions/gt"
import semverLt from "semver/functions/lt"

import { IStatusMessage } from "../../../shared/statusMessage/types"

export const getShouldShowMessage = ({
  statusMessage,
  lastDismissedMessageId,
  version = process.env.VERSION as string,
}: {
  statusMessage: IStatusMessage | undefined
  lastDismissedMessageId?: string
  version?: string
}) => {
  if (!statusMessage || statusMessage.message === null) {
    return false
  }
  if (statusMessage.dismissable) {
    if (statusMessage.id === lastDismissedMessageId) {
      return false
    }
  }
  if (version && statusMessage.minVersion) {
    if (semverLt(version, statusMessage.minVersion)) {
      return false
    }
  }
  if (version && statusMessage.maxVersion) {
    if (semverGt(version, statusMessage.maxVersion)) {
      return false
    }
  }
  return true
}
