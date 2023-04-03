import { Call } from "starknet"

import { ARGENT_TRANSACTION_SIMULATION_URL } from "../api/constants"
import { fetcher } from "../api/fetcher"
import { sendMessage, waitForMessage } from "../messages"
import { findTransfersAndApprovals } from "./findTransferAndApproval"
import {
  ApiTransactionSimulationResponse,
  IFetchTransactionSimulation,
  TransactionSimulationApproval,
  TransactionSimulationTransfer,
} from "./types"

export const fetchTransactionSimulation = async ({
  transactions,
  fetcher: fetcherImpl = fetcher,
}: IFetchTransactionSimulation) => {
  if (!ARGENT_TRANSACTION_SIMULATION_URL) {
    throw "Transaction simulation endpoint is not defined"
  }

  sendMessage({
    type: "SIMULATE_TRANSACTION_INVOCATION",
    data: transactions,
  })

  const data = await Promise.race([
    waitForMessage("SIMULATE_TRANSACTION_INVOCATION_RES"),
    waitForMessage("SIMULATE_TRANSACTION_INVOCATION_REJ"),
  ])

  if ("error" in data) {
    throw data.error
  }

  try {
    const { invocation, chainId } = data

    const backendSimulation =
      await fetcherImpl<ApiTransactionSimulationResponse>(
        ARGENT_TRANSACTION_SIMULATION_URL,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...invocation,
            chainId,
          }),
        },
      )
    return backendSimulation
  } catch (e) {
    console.error("Failed to fetch transaction simulation from backend", e)
    console.warn("Falling back to client-side simulation")

    return doTransactionSimulation(transactions)
  }
}

export const doTransactionSimulation = async (transactions: Call | Call[]) => {
  sendMessage({ type: "SIMULATE_TRANSACTION_FALLBACK", data: transactions })

  const data = await Promise.race([
    waitForMessage("SIMULATE_TRANSACTION_FALLBACK_RES"),
    waitForMessage("SIMULATE_TRANSACTION_FALLBACK_REJ"),
  ])

  if ("error" in data) {
    throw data.error
  }

  const internalCalls = data.trace.function_invocation?.internal_calls

  const transfers: TransactionSimulationTransfer[] = []
  const approvals: TransactionSimulationApproval[] = []

  if (!internalCalls) {
    return { transfers, approvals }
  }

  findTransfersAndApprovals(internalCalls, approvals, transfers)

  return { transfers, approvals }
}
