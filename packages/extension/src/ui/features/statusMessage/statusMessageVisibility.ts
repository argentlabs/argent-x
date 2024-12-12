import { isArray } from "lodash-es"
import semverGt from "semver/functions/gt"
import semverLt from "semver/functions/lt"

import type { IStatusMessage } from "../../../shared/statusMessage/types"

/**
 * Checks if `statusMessage` matches specified `version`
 *
 * @returns `true` if either the version is a match, or if `minVersion` and `maxVersion` are not specified
 */

export const messageMatchesVersion = ({
  statusMessage,
  version = process.env.VERSION,
}: {
  statusMessage: IStatusMessage | undefined
  version?: string
}) => {
  if (!statusMessage || !version) {
    return false
  }
  if (statusMessage.minVersion) {
    if (semverLt(version, statusMessage.minVersion)) {
      return false
    }
  }
  if (statusMessage.maxVersion) {
    if (semverGt(version, statusMessage.maxVersion)) {
      return false
    }
  }
  return true
}

/** filters a single or array of messages for a specific version */

export const getMessageForVersion = ({
  statusMessage,
  version,
}: {
  statusMessage: IStatusMessage[] | IStatusMessage | undefined
  version?: string
}) => {
  if (isArray(statusMessage)) {
    for (const message of statusMessage) {
      if (messageMatchesVersion({ statusMessage: message, version })) {
        return message
      }
    }
  } else {
    if (messageMatchesVersion({ statusMessage, version })) {
      return statusMessage
    }
  }
}

/** determines the message to show given the version and dismissed status */

export const getMessageToShow = ({
  statusMessage,
  lastDismissedMessageId,
  version,
}: {
  statusMessage: IStatusMessage[] | IStatusMessage | undefined
  lastDismissedMessageId?: string
  version?: string
}) => {
  const messageForVersion = getMessageForVersion({
    statusMessage,
    version,
  })
  if (!messageForVersion || messageForVersion.message === null) {
    return
  }
  if (messageForVersion.dismissable) {
    if (messageForVersion.id === lastDismissedMessageId) {
      return
    }
  }
  return messageForVersion
}

/** convenience flag for whether there is a message to show */

export const getShouldShowMessage = ({
  statusMessage,
  lastDismissedMessageId,
  version,
}: {
  statusMessage: IStatusMessage[] | IStatusMessage | undefined
  lastDismissedMessageId?: string
  version?: string
}) => {
  const messageToShow = getMessageToShow({
    statusMessage,
    lastDismissedMessageId,
    version,
  })
  return !!messageToShow
}
