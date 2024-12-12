import { useEffect, useState } from "react"

import { transactionsRepo } from "../../../shared/transactions/store"
import { getTransactionStatus } from "../../../shared/transactions/utils"
import { accountsEqual } from "../../../shared/utils/accountsEqual"
import type { BaseWalletAccount } from "../../../shared/wallet.model"

export const useIsAccountDeploying = (account?: BaseWalletAccount) => {
  const [isDeploying, setIsDeploying] = useState<boolean>(false)

  useEffect(() => {
    const fetchTransaction = async () => {
      const [transaction] = await transactionsRepo.get(
        (transaction) =>
          accountsEqual(transaction.account, account) &&
          !!transaction.meta?.isDeployAccount,
      )
      const { finality_status } = getTransactionStatus(transaction)

      setIsDeploying(
        finality_status === "PENDING" || finality_status === "RECEIVED",
      )
    }

    void fetchTransaction()
  }, [account])

  return isDeploying
}
