import { Status } from "starknet"

export interface TransactionMeta {
  title: string
}

export interface TransactionStatus {
  hash: string
  walletAddress?: string
  status: Status
  meta?: TransactionMeta
}
