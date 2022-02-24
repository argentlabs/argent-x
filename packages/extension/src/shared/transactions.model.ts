import { Status } from "starknet"

export interface TransactionMeta {
  title: string
}

export interface TransactionStatus {
  hash: string
  accountAddress?: string
  status: Status
  meta?: TransactionMeta
}
