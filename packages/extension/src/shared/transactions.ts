import { capitalize } from "lodash-es"
import { Status } from "starknet"

import { WalletAccount } from "./wallet.model"

export interface TransactionMeta {
  title?: string
  subTitle?: string
}

export interface TransactionBase {
  hash: string
  account: {
    networkId: string
  }
}

export interface TransactionRequest extends TransactionBase {
  account: WalletAccount
  meta?: TransactionMeta
}

export interface Transaction extends TransactionRequest {
  status: Status
  failureReason?: { code: string; error_message: string }
  timestamp: number
}

export function entryPointToHumanReadable(entryPoint: string): string {
  try {
    return capitalize(entryPoint.replaceAll("_", " "))
  } catch {
    return entryPoint
  }
}
