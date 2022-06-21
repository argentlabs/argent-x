import { useEffect, useState } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Account } from "../accounts/Account"
import { getStatus } from "../accounts/accounts.service"
import { useTransactionStatus } from "./useTransactionStatus"

export const useAccountStatus = (
  account: Account,
  activeAccount?: BaseWalletAccount,
) => {
  const deployStatus = useTransactionStatus(
    account.deployTransaction,
    account.network.id,
  )
  const [isDeployed, setIsDeployed] = useState(true)

  useEffect(() => {
    if (deployStatus === "SUCCESS") {
      account.completeDeployTx()
    }
  }, [account, deployStatus])

  useEffect(() => {
    if (deployStatus !== "PENDING") {
      ;(async () => {
        try {
          const code = await account.provider.getCode(account.address)
          setIsDeployed(code.bytecode.length !== 0)
        } catch {
          // as api isnt very stable (especially this endpoint) lets do nothing if the request fails
        }
      })()
    }
  }, [deployStatus])

  if (deployStatus !== "PENDING" && !isDeployed) {
    return { code: "ERROR" as const, text: "Undeployed" }
  }

  return getStatus(account, activeAccount, deployStatus === "SUCCESS")
}
