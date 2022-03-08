import type { InvokeFunctionTransaction, typedData } from "starknet"

import type { ExtQueueItem } from "../background/actionQueue"
import { StarkSignerType } from "./starkSigner"

export type ActionItem =
  | {
      type: "CONNECT_DAPP"
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
  | {
      type: "ADD_TOKEN"
      payload: {
        address: string
        decimals?: string
        name?: string
        symbol?: string
        networkId?: string
      }
    }

export type ExtActionItem = ExtQueueItem<ActionItem>
