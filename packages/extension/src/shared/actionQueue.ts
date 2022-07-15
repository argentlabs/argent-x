import type { Abi, Call, InvocationsDetails, typedData } from "starknet"

import type { ExtQueueItem as ExtensionQueueItem } from "../background/actionQueue"

export interface TransactionActionPayload {
  transactions: Call | Call[]
  abis?: Abi[]
  transactionsDetail?: InvocationsDetails
}

export type ActionItem =
  | {
      type: "CONNECT_DAPP"
      payload: {
        host: string
      }
    }
  | {
      type: "TRANSACTION"
      payload: TransactionActionPayload
    }
  | {
      type: "SIGN"
      payload: typedData.TypedData
    }
  | {
      type: "REQUEST_TOKEN"
      payload: {
        address: string
        decimals?: number
        name?: string
        symbol?: string
        networkId?: string
      }
    }
  | {
      type: "REQUEST_ADD_CUSTOM_NETWORK"
      payload: {
        id: string
        name: string
        chainId: string // A 0x-prefixed hexadecimal string
        baseUrl: string
        explorerUrl?: string
        accountImplementation?: string
        rpcUrl?: string
      }
    }
  | {
      type: "REQUEST_SWITCH_CUSTOM_NETWORK"
      payload: {
        id: string
        name: string
        chainId: string // A 0x-prefixed hexadecimal string
        baseUrl: string
        explorerUrl?: string
        accountImplementation?: string
        rpcUrl?: string
      }
    }

export type ExtensionActionItem = ExtensionQueueItem<ActionItem>
