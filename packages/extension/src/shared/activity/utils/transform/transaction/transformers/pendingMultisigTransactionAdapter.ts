import { MultisigPendingTransaction } from "../../../../../multisig/pendingTransactionsStore"
import { Transaction } from "../../../../../transactions"
import { WalletAccount } from "../../../../../wallet.model"

export const getTransactionFromPendingMultisigTransaction = (
  pendingMultisigTransaction: MultisigPendingTransaction,
  account: WalletAccount,
): Transaction => {
  const { timestamp, transaction } = pendingMultisigTransaction
  return {
    account,
    meta: {
      transactions: transaction.calls,
    },
    timestamp,
    status: {
      finality_status: "NOT_RECEIVED",
    },
    hash: pendingMultisigTransaction.transactionHash,
  }
}
