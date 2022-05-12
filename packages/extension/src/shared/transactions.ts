import { Status } from "starknet"

import { WalletAccount } from "./wallet.model"

export interface TransactionMeta {
  title?: string
  subTitle?: string
}

export interface AddTransaction {
  hash: string
  account: WalletAccount
  meta?: TransactionMeta
}

export interface Transaction extends AddTransaction {
  status: Status
  failureReason?: { code: string; error_message: string }
  timestamp: number
}
