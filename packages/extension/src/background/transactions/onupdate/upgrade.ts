import { optimisticImplUpdate } from "../../../shared/account/optimisticImplUpdate"
import { accountService } from "../../../shared/account/service"
import { transformTransaction } from "../../../shared/activity/utils/transform"
import { isUpgradeTransaction } from "../../../shared/activity/utils/transform/is"
import type { Transaction } from "../../../shared/transactions"
import { isSuccessfulTransaction } from "../../../shared/transactions/utils"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { isSafeUpgradeTransaction } from "../../../shared/utils/isSafeUpgradeTransaction"
import type { WalletAccount } from "../../../shared/wallet.model"
import type { TransactionUpdateListener } from "./type"

export const handleUpgradeTransaction: TransactionUpdateListener = async (
  transactions,
) => {
  const upgradeTxns = transactions.filter(
    (tx) => isSafeUpgradeTransaction(tx) && isSuccessfulTransaction(tx),
  ) // Check if the transaction is a safe upgrade transaction and if it was successful

  if (upgradeTxns.length === 0) {
    return
  }

  const allAccounts = await accountService.get()

  const updatedAccounts = upgradeTxns.reduce<WalletAccount[]>((acc, tx) => {
    const account = allAccounts.find((a) => accountsEqual(a, tx.account))
    const newClassHash = extractClasssHashFromTx(tx)
    if (account && newClassHash) {
      const updatedAccount = optimisticImplUpdate(account, newClassHash)
      acc.push(updatedAccount)
    }
    return acc
  }, [])

  await accountService.upsert(updatedAccounts)
}

const extractClasssHashFromTx = (tx: Transaction) => {
  let newClassHash = tx.meta?.newClassHash
  if (!newClassHash) {
    const transformedTx = transformTransaction({ transaction: tx })
    if (!!transformedTx && isUpgradeTransaction(transformedTx))
      newClassHash = transformedTx.newClassHash
  }
  return newClassHash
}
