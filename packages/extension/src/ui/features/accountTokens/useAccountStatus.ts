import { isFunction } from "lodash-es"
import { useEffect, useMemo, useState } from "react"

import { BaseWalletAccount } from "../../../shared/wallet.model"
import { Account } from "../accounts/Account"
import { AccountStatus, getStatus } from "../accounts/accounts.service"
import { useTransactionStatus } from "./useTransactionStatus"

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
  const [isDeployed, setIsDeployed] = useState(true)

  useEffect(() => {
    if (deployStatus === "SUCCESS" && isFunction(account.completeDeployTx)) {
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
    // just rerun when deployStatus changes
  }, [deployStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  const status = useMemo(() => {
    if (deployStatus !== "PENDING" && !isDeployed) {
      return ERROR_STATUS
    }
    return getStatus(account, activeAccount, deployStatus === "SUCCESS")
  }, [account, activeAccount, deployStatus, isDeployed])

  return status
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
