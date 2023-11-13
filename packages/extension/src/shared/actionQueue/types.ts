import type {
  Abi,
  Call,
  DeclareContractPayload,
  InvocationsDetails,
  UniversalDeployerContractPayload,
  typedData,
} from "starknet"

import { Network } from "../network"
import { TransactionMeta } from "../transactions"
import { BaseWalletAccount } from "../wallet.model"
import { ActionQueueItem } from "./schema"
import { SignMessageOptions } from "../messages/ActionMessage"

export type ExtQueueItem<T> = ActionQueueItem & T

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
      type: "DEPLOY_MULTISIG_ACTION"
      payload: BaseWalletAccount
    }
  | {
      type: "SIGN"
      payload: { typedData: typedData.TypedData; options: SignMessageOptions }
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
      type: "REQUEST_SWITCH_CUSTOM_NETWORK"
      payload: Network
    }
  | {
      type: "REQUEST_ADD_CUSTOM_NETWORK"
      payload: Network
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
