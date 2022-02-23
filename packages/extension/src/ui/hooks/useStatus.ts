import { useEffect, useState } from "react"
import { Status as TxStatus } from "starknet"

import { messageStream } from "../../shared/messages"
import { Account } from "../Account"
import { getStatus } from "../utils/accounts"
import { getTransactionStatus } from "../utils/messaging"

function transformStatus(status: TxStatus): Status {
  return ["ACCEPTED_ON_L1", "ACCEPTED_ON_L2"].includes(status)
    ? "SUCCESS"
    : status === "REJECTED"
    ? "ERROR"
    : "PENDING"
}

type Status = "UNKNOWN" | "PENDING" | "SUCCESS" | "ERROR"
export const useTxStatus = (txHash?: string, network?: string): Status => {
  const [txStatus, setTxStatus] = useState<Status>("UNKNOWN")

  useEffect(() => {
    if (txHash && network) {
      getTransactionStatus(txHash, network).then(({ status }) => {
        if (status) {
          setTxStatus(transformStatus(status))
        } else {
          setTxStatus("UNKNOWN")
        }
      })
      messageStream.subscribe(([message]) => {
        if (message.type === "TRANSACTION_UPDATES") {
          const matchingTx = message.data.find((tx) => tx.hash === txHash)
          if (matchingTx) {
            setTxStatus(transformStatus(matchingTx.status))
          }
        }
      })
    }
  }, [txHash, network])

  return txStatus
}

export const useStatus = (account: Account, activeAccountAddress?: string) => {
  const deployStatus = useTxStatus(account.deployTransaction, account.networkId)
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
