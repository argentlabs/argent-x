import { Transaction } from "../../../../../../shared/transactions"
import { WalletAccount } from "../../../../../../shared/wallet.model"
import { EnrichedMultisigPendingTransaction } from "../../../../multisig/multisigTransactions.state"

export const getTransactionFromPendingMultisigTransaction = (
  pendingMultisigTransaction: EnrichedMultisigPendingTransaction,
  account: WalletAccount,
): Transaction => {
  const { timestamp, transactions } = pendingMultisigTransaction
  return {
    account,
    meta: {
      transactions,
    },
    timestamp,
    status: "NOT_RECEIVED",
    hash: pendingMultisigTransaction.data.content.transactionHash ?? "0x0",
  }
}
