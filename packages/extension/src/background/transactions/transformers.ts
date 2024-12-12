import type { Transaction } from "../../shared/transactions"
import type { WalletAccount } from "../../shared/wallet.model"
import type { VoyagerTransaction } from "./sources/voyager.model"

export const mapVoyagerTransactionToTransaction = (
  transaction: VoyagerTransaction,
  account: WalletAccount,
  meta?: { title?: string; subTitle?: string },
): Transaction => ({
  hash: transaction.hash,
  account,
  meta,
  status: {
    finality_status: transaction.status as any,
  },
  timestamp: transaction.timestamp,
})
