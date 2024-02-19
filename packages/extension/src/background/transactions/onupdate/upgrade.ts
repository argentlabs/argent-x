import { TransactionUpdateListener } from "./type"
import { optimisticImplUpdate } from "../../../shared/account/optimisticImplUpdate"
import { accountService } from "../../../shared/account/service"
import { isSafeUpgradeTransaction } from "../../../shared/utils/isUpgradeTransaction"
import { isSuccessfulTransaction } from "../../../shared/transactions/utils"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import { WalletAccount } from "../../../shared/wallet.model"

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
    if (account) {
      const updatedAccount = optimisticImplUpdate(
        account,
        tx.meta?.newClassHash,
      )
      acc.push(updatedAccount)
    }
    return acc
  }, [])

  await accountService.upsert(updatedAccounts)
}
