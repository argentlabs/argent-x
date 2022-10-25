import { isFunction } from "lodash-es"
import { useEffect, useMemo } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Account } from "../accounts/Account"
import { AccountStatus, getStatus } from "../accounts/accounts.service"
import { useTransactionStatus } from "./useTransactionStatus"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ERROR_STATUS: AccountStatus = {
  code: "ERROR",
  text: "Deployment failed",
}

export const useAccountStatus = (
  account: Account,
  activeAccount?: BaseWalletAccount,
) => {
  const deployStatus = useTransactionStatus(
    account.deployTransaction,
    account.network.id,
  )

  useEffect(() => {
    if (
      (deployStatus === "SUCCESS" || deployStatus === "ERROR") &&
      isFunction(account.completeDeployTx)
    ) {
      account.completeDeployTx()
    }
  }, [account, deployStatus])

  return useMemo(() => {
    return getStatus(account, activeAccount, deployStatus === "SUCCESS")
  }, [account, activeAccount, deployStatus])
}

export const useAccountIsDeployed = (
  account: Account,
  activeAccount?: BaseWalletAccount,
) => {
  const status = useAccountStatus(account, activeAccount)
  const accountIsDeployed =
    status.code !== "DEPLOYING" && status.code !== "ERROR"
  return accountIsDeployed
}
