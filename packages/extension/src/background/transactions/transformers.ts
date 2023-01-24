import { Transaction, TransactionMeta } from "../../shared/transactions"
import { WalletAccount } from "../../shared/wallet.model"
import { VoyagerTransaction } from "./sources/voyager"

export const mapVoyagerTransactionToTransaction = (
  transaction: VoyagerTransaction,
  account: WalletAccount,
  meta?: TransactionMeta,
): Transaction => ({
  hash: transaction.hash,
  account,
  meta,
  status: "ACCEPTED_ON_L2",
  timestamp: transaction.timestamp,
})
