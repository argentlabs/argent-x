import { isString } from "lodash-es"

import { ExtensionActionItem } from "../../shared/actionQueue/types"
import { sendMessage, waitForMessage } from "../../shared/messages"

export const getActions = async () => {
  sendMessage({ type: "GET_ACTIONS" })
  return waitForMessage("GET_ACTIONS_RES")
}

export const approveAction = (action: ExtensionActionItem | string) => {
  const actionHash = isString(action) ? action : action.meta.hash
  sendMessage({ type: "APPROVE_ACTION", data: { actionHash } })
}

export const rejectAction = (action: ExtensionActionItem | string) => {
  const actionHash = isString(action) ? action : action.meta.hash
  sendMessage({ type: "REJECT_ACTION", data: { actionHash } })
}
