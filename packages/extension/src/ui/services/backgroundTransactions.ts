import { Call } from "starknet"

import { sendMessage, waitForMessage } from "../../shared/messages"
import { ExecuteTransactionRequest } from "../../shared/messages/TransactionMessage"
import { BaseWalletAccount } from "../../shared/wallet.model"

export const executeTransaction = (data: ExecuteTransactionRequest) => {
  sendMessage({ type: "EXECUTE_TRANSACTION", data })
}

export const getEstimatedFee = async (call: Call | Call[]) => {
  sendMessage({ type: "ESTIMATE_TRANSACTION_FEE", data: call })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_TRANSACTION_FEE_RES"),
    waitForMessage("ESTIMATE_TRANSACTION_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

export const getAccountDeploymentEstimatedFee = async (
  account?: BaseWalletAccount,
) => {
  sendMessage({ type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE", data: account })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES"),
    waitForMessage("ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ"),
  ])

  if ("error" in response) {
    console.error(response.error)
    throw response.error
  }

  return response
}

// for debugging purposes
try {
  ;(window as any).downloadBackup = () => {
    sendMessage({ type: "DOWNLOAD_BACKUP_FILE" })
  }
} catch {
  // ignore
}
