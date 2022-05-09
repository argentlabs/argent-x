import type { Abi, Call, InvocationsDetails, typedData } from "starknet"

import type { ExtQueueItem as ExtensionQueueItem } from "../background/actionQueue"

export type ActionItem =
  | {
      type: "CONNECT_DAPP"
      payload: {
        host: string
      }
    }
  | {
      type: "TRANSACTION"
      payload: {
        transactions: Call | Call[]
        abis?: Abi[]
        transactionsDetail?: InvocationsDetails
      }
    }
  | {
      type: "SIGN"
      payload: typedData.TypedData
    }
  | {
      type: "REQUEST_TOKEN"
      payload: {
        address: string
        decimals?: string
        name?: string
        symbol?: string
        networkId?: string
      }
    }

export type ExtensionActionItem = ExtensionQueueItem<ActionItem>
