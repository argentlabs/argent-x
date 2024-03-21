import { Call } from "starknet"

import { sendMessage, waitForMessage } from "../../shared/messages"
import { ExecuteTransactionRequest } from "../../shared/messages/TransactionMessage"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { messageClient } from "./messaging/trpc"
import { DeclareContract, DeployContract } from "../../shared/udc/schema"
import { Address } from "@argent/x-shared"

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

export const getSimulationEstimatedFee = async (
  call: Call | Call[],
  feeTokenAddress: Address,
) => {
  void sendMessage({
    type: "SIMULATE_TRANSACTIONS",
    data: { call, feeTokenAddress },
  })

  const response = await Promise.race([
    waitForMessage("SIMULATE_TRANSACTIONS_RES"),
    waitForMessage("SIMULATE_TRANSACTIONS_REJ"),
  ])

  if (!response) {
    console.warn("Old Account detected. Falling back to client-side simulation")
    return
  }

  if ("error" in response) {
    throw response.error
  }

  return response.feeEstimation
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

export const getDeclareContractEstimatedFee = async (data: DeclareContract) => {
  void sendMessage({ type: "ESTIMATE_DECLARE_CONTRACT_FEE", data })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_DECLARE_CONTRACT_FEE_RES"),
    waitForMessage("ESTIMATE_DECLARE_CONTRACT_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

export const getDeployContractEstimatedFee = async (data: DeployContract) => {
  void sendMessage({ type: "ESTIMATE_DEPLOY_CONTRACT_FEE", data })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_DEPLOY_CONTRACT_FEE_RES"),
    waitForMessage("ESTIMATE_DEPLOY_CONTRACT_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}
