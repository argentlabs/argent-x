import type {
  Abi,
  Call,
  DeclareContractPayload,
  InvocationsDetails,
  UniversalDeployerContractPayload,
  typedData,
} from "starknet"

import { TransactionMeta } from "../transactions"
import { BaseWalletAccount } from "../wallet.model"

export interface QueueItem {
  meta: {
    hash: string
    expires: number
  }
}

export type ExtQueueItem<T> = QueueItem & T

export interface TransactionActionPayload {
  transactions: Call | Call[]
  abis?: Abi[]
  transactionsDetail?: InvocationsDetails
  meta?: TransactionMeta
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
      type: "DEPLOY_ACCOUNT_ACTION"
      payload: BaseWalletAccount
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
  | {
      type: "DECLARE_CONTRACT_ACTION"
      payload: DeclareContractPayload
    }
  | {
      type: "DEPLOY_CONTRACT_ACTION"
      payload: UniversalDeployerContractPayload
    }

export type ExtensionActionItem = ExtQueueItem<ActionItem>
