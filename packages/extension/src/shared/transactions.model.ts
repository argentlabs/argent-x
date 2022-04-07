import { Provider, Status } from "starknet"

export interface TransactionMeta {
  title?: string
  subTitle?: string
}

export interface FetchedTransactionStatus {
  hash: string
  status: Status
  failureReason?: { code: string; error_message: string }
}

export interface TransactionStatus extends FetchedTransactionStatus {
  accountAddress?: string
  meta?: TransactionMeta
}

export interface TransactionStatusWithProvider extends TransactionStatus {
  provider: Provider
}

export type TransactionListener = (transactions: TransactionStatus[]) => void
