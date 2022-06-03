import { BigNumber } from "ethers"
import { Call, number } from "starknet"

import { sendMessage, waitForMessage } from "../../shared/messages"

export const getTransactions = async (address: string) => {
  sendMessage({ type: "GET_TRANSACTIONS" })
  const allTransactions = await waitForMessage("GET_TRANSACTIONS_RES")
  return allTransactions.filter(({ account }) => account.address === address)
}

export const getTransactionStatus = async (hash: string, network: string) => {
  sendMessage({ type: "GET_TRANSACTION", data: { hash, network } })
  return waitForMessage(
    "GET_TRANSACTION_RES",
    (status) => status.data.hash === hash,
  )
}

export const getEstimatedFee = async (call: Call | Call[]) => {
  sendMessage({ type: "ESTIMATE_TRANSACTION_FEE", data: call })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_TRANSACTION_FEE_RES"),
    waitForMessage("ESTIMATE_TRANSACTION_FEE_REJ").then(() => {
      throw new Error("Failed to estimate fee")
    }),
  ])

  return {
    ...response,
    amount: BigNumber.from(response.amount),
    suggestedMaxFee: BigNumber.from(response.suggestedMaxFee),
  }
}

export const updateTransactionFee = async (
  actionHash: string,
  maxFee: number.BigNumberish,
) => {
  sendMessage({ type: "UPDATE_TRANSACTION_FEE", data: { actionHash, maxFee } })
  return waitForMessage(
    "UPDATE_TRANSACTION_FEE_RES",
    (x) => x.data.actionHash === actionHash,
  )
}

// for debugging purposes
try {
  ;(window as any).downloadBackup = () => {
    sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
  }
} catch {
  // ignore
}
