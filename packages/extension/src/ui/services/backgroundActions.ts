import { isString } from "lodash-es"

import { ExtensionActionItem } from "../../shared/actionQueue/types"
import { sendMessage, waitForMessage } from "../../shared/messages"
import { AllowArray } from "../../shared/storage/types"

export const getActions = async () => {
  sendMessage({ type: "GET_ACTIONS" })
  return waitForMessage("GET_ACTIONS_RES")
}

export const approveAction = (action: ExtensionActionItem | string) => {
  const actionHash = isString(action) ? action : action.meta.hash
  return sendMessage({ type: "APPROVE_ACTION", data: { actionHash } })
}

export const rejectAction = (actionHash: AllowArray<string>) => {
  return sendMessage({ type: "REJECT_ACTION", data: { actionHash } })
}
