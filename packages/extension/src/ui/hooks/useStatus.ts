import { useEffect, useState } from "react"
import { Provider, defaultProvider } from "starknet"

import { getStatus } from "../utils/wallet"
import { Wallet } from "../Wallet"

type Status = "PENDING" | "SUCCESS" | "ERROR" | "SKIPED"
export const useTxStatus = (
  txHash?: string,
  provider: Provider = defaultProvider,
): Status => {
  const [txStatus, setTxStatus] = useState<Status>("PENDING")

  useEffect(() => {
    if (txHash)
      provider
        .waitForTx(txHash)
        .then(() => {
          setTxStatus("SUCCESS")
        })
        .catch(() => {
          setTxStatus("ERROR")
        })
  }, [txHash])

  return txHash ? txStatus : "SKIPED"
}

export const useStatus = (wallet: Wallet, activeWalletAddress?: string) => {
  const deployStatus = useTxStatus(
    wallet.deployTransaction,
    wallet.contract.provider,
  )

  useEffect(() => {
    if (deployStatus === "SUCCESS") wallet.completeDeployTx()
  }, [wallet, deployStatus])

  return getStatus(wallet, activeWalletAddress, deployStatus === "SUCCESS")
}
