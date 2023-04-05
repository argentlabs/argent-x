import { MultisigPendingTransaction } from "../../../../../../shared/multisig/pendingTransactionsStore"
import { Transaction } from "../../../../../../shared/transactions"
import { WalletAccount } from "../../../../../../shared/wallet.model"

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
    status: "NOT_RECEIVED",
    hash: pendingMultisigTransaction.transactionHash,
  }
}
