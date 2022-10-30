import { Call } from "starknet"

import { sendMessage, waitForMessage } from "../../shared/messages"
import { ExecuteTransactionRequest } from "../../shared/messages/TransactionMessage"

export const executeTransaction = (data: ExecuteTransactionRequest) => {
  sendMessage({ type: "EXECUTE_TRANSACTION", data })
}

export const getEstimatedFee = async (call: Call | Call[]) => {
  sendMessage({ type: "ESTIMATE_TRANSACTION_FEE", data: call })

  console.log("Sending ESTIMATE_TRANSACTION_FEE!")

  const response = await Promise.race([
    waitForMessage("ESTIMATE_TRANSACTION_FEE_RES"),
    waitForMessage("ESTIMATE_TRANSACTION_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  console.log("ESTIMATE_TRANSACTION_FEE_RES", response)

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
