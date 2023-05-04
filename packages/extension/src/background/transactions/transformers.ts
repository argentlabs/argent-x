import { Transaction } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { VoyagerTransaction } from "./sources/voyager"

export const mapVoyagerTransactionToTransaction = (
  transaction: VoyagerTransaction,
  account: WalletAccount,
  meta?: { title?: string; subTitle?: string },
): Transaction => ({
  hash: transaction.hash,
  account,
  meta,
  status: transaction.status,
  timestamp: transaction.timestamp,
})
