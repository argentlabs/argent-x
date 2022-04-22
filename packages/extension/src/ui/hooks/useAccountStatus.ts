import { useEffect, useState } from "react"

import { Account } from "../Account"
import { getStatus } from "../utils/accounts"
import { useTransactionStatus } from "./useTransactionStatus"

export const useAccountStatus = (
  account: Account,
  activeAccountAddress?: string,
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
          const code = await account.contract.provider.getCode(account.address)
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

  return getStatus(account, activeAccountAddress, deployStatus === "SUCCESS")
}
