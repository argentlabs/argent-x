import { Call, UniversalDeployerContractPayload } from "starknet"

import { sendMessage, waitForMessage } from "../../shared/messages"
import { ExecuteTransactionRequest } from "../../shared/messages/TransactionMessage"
import { DeclareContract } from "../../shared/udc/type"
import { BaseWalletAccount } from "../../shared/wallet.model"

export const executeTransaction = (data: ExecuteTransactionRequest) => {
  return sendMessage({ type: "EXECUTE_TRANSACTION", data })
}

export const getEstimatedFeeFromSequencer = async (call: Call | Call[]) => {
  void sendMessage({ type: "ESTIMATE_TRANSACTION_FEE", data: call })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_TRANSACTION_FEE_RES"),
    waitForMessage("ESTIMATE_TRANSACTION_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

export const getSimulationEstimatedFee = async (call: Call | Call[]) => {
  void sendMessage({ type: "SIMULATE_TRANSACTIONS", data: call })

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
  account?: BaseWalletAccount,
) => {
  sendMessage({ type: "ESTIMATE_ACCOUNT_DEPLOYMENT_FEE", data: account })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_RES"),
    waitForMessage("ESTIMATE_ACCOUNT_DEPLOYMENT_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

export const getDeclareContractEstimatedFee = async (data: DeclareContract) => {
  sendMessage({ type: "ESTIMATE_DECLARE_CONTRACT_FEE", data })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_DECLARE_CONTRACT_FEE_RES"),
    waitForMessage("ESTIMATE_DECLARE_CONTRACT_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}

export const getDeployContractEstimatedFee = async (
  data: UniversalDeployerContractPayload,
) => {
  sendMessage({ type: "ESTIMATE_DEPLOY_CONTRACT_FEE", data })

  const response = await Promise.race([
    waitForMessage("ESTIMATE_DEPLOY_CONTRACT_FEE_RES"),
    waitForMessage("ESTIMATE_DEPLOY_CONTRACT_FEE_REJ"),
  ])

  if ("error" in response) {
    throw response.error
  }

  return response
}
