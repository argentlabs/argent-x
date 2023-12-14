import type {
  Abi,
  Call,
  DeclareContractPayload,
  InvocationsDetails,
  UniversalDeployerContractPayload,
  typedData,
} from "starknet"
import { z } from "zod"

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
  createdAt?: number
}

type DeployActionPayload = {
  account: BaseWalletAccount
  /** the calldata to display to the end user - cosmetic only */
  displayCalldata?: string[]
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
      type: "DEPLOY_ACCOUNT"
      payload: DeployActionPayload
    }
  | {
      type: "DEPLOY_MULTISIG"
      payload: DeployActionPayload
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
      type: "DECLARE_CONTRACT"
      payload: DeclareContractPayload
    }
  | {
      type: "DEPLOY_CONTRACT"
      payload: UniversalDeployerContractPayload
    }

export type ExtensionActionItem = ExtQueueItem<ActionItem>

export type ExtensionActionItemOfType<T extends ActionItem["type"]> =
  ExtQueueItem<Extract<ActionItem, { type: T }>>

const isTransactionActionItemSchema = z.object({
  type: z.literal("TRANSACTION"),
})

export function isTransactionActionItem(
  item: unknown,
): item is ExtensionActionItemOfType<"TRANSACTION"> {
  return isTransactionActionItemSchema.safeParse(item).success
}
