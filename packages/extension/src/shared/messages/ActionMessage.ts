import type { typedData } from "starknet"

import { ExtensionActionItem } from "../actionQueue"

export type ActionMessage =
  | { type: "GET_ACTIONS" }
  | {
      type: "GET_ACTIONS_RES"
      data: ExtensionActionItem[]
    }
  | { type: "APPROVE_ACTION"; data: { actionHash: string } }
  | { type: "REJECT_ACTION"; data: { actionHash: string } }
  | {
      type: "ACTIONS_QUEUE_UPDATE"
      data: { actions: ExtensionActionItem[] }
    }
  | { type: "SIGN_MESSAGE"; data: typedData.TypedData }
  | { type: "SIGN_MESSAGE_RES"; data: { actionHash: string } }
  | { type: "SIGNATURE_FAILURE"; data: { actionHash: string } }
  | {
      type: "SIGNATURE_SUCCESS"
      data: { r: string; s: string; actionHash: string }
    }
