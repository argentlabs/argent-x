import { Status } from "starknet"

import { WalletAccount } from "./wallet.model"

export interface TransactionMeta {
  title?: string
  subTitle?: string
}

export interface TransactionRequest {
  hash: string
  account: WalletAccount
  meta?: TransactionMeta
}

export interface Transaction extends TransactionRequest {
  status: Status
  failureReason?: { code: string; error_message: string }
  timestamp: number
}
