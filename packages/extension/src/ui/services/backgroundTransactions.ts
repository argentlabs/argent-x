import type { Call } from "starknet"

import { sendMessage } from "../../shared/messages/messages"
import type { ExecuteTransactionRequest } from "../../shared/messages/TransactionMessage"
import type { BaseWalletAccount } from "../../shared/wallet.model"
import { messageClient } from "./trpc"

export const executeTransaction = (data: ExecuteTransactionRequest) => {
  return sendMessage({ type: "EXECUTE_TRANSACTION", data })
}

export const getEstimatedFee = async (
  call: Call | Call[],
  account: BaseWalletAccount,
  feeTokenAddress: string,
) => {
  return messageClient.transactionEstimate.estimateTransaction.query({
    transactions: call,
    account,
    feeTokenAddress,
  })
}

export const getAccountDeploymentEstimatedFee = async (
  feeTokenAddress: string,
  account?: BaseWalletAccount,
) => {
  return messageClient.transactionEstimate.estimateAccountDeploy.query({
    account,
    feeTokenAddress,
  })
}
