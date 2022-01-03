import type { InvokeFunctionTransaction, typedData } from "starknet"

import type { ExtQueueItem } from "../background/actionQueue"

export type ActionItem =
  | {
      type: "CONNECT"
      payload: {
        host: string
      }
    }
  | {
      type: "TRANSACTION"
      payload: InvokeFunctionTransaction
    }
  | {
      type: "SIGN"
      payload: typedData.TypedData
    }

export type ExtActionItem = ExtQueueItem<ActionItem>
