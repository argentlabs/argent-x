import type {
  Abi,
  Call,
  InvocationsDetails,
  InvokeFunctionTransaction,
  typedData,
} from "starknet"

import type { ExtQueueItem } from "../background/actionQueue"

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
      type: "TRANSACTION_LEGACY"
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
