import { useEffect, useState } from "react"
import { Status as TxStatus } from "starknet"

import { messageStream } from "../../shared/messages"
import { getTransactionStatus } from "../utils/messaging"
import { getStatus } from "../utils/wallet"
import { Wallet } from "../Wallet"

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

export const useStatus = (wallet: Wallet, activeWalletAddress?: string) => {
  const deployStatus = useTxStatus(wallet.deployTransaction, wallet.networkId)

  useEffect(() => {
    if (deployStatus === "SUCCESS") wallet.completeDeployTx()
  }, [wallet, deployStatus])

  return getStatus(wallet, activeWalletAddress, deployStatus === "SUCCESS")
}
