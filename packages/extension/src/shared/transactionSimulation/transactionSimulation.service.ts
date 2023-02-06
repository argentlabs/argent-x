import { Call } from "starknet"

import { ARGENT_TRANSACTION_SIMULATION_URL } from "../api/constants"
import { fetcher } from "../api/fetcher"
import { sendMessage, waitForMessage } from "../messages"
import { findTransfersAndApprovals } from "./findTransferAndApproval"
import {
  ApprovalEvent,
  IFetchTransactionSimulation,
  TransferEvent,
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
    const backendSimulation = fetcherImpl(ARGENT_TRANSACTION_SIMULATION_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return backendSimulation
  } catch (e) {
    console.warn("Failed to fetch transaction simulation from backend", e)
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

  const transfers: Array<TransferEvent> = []
  const approvals: Array<ApprovalEvent> = []

  if (!internalCalls) {
    return { transfers, approvals }
  }

  findTransfersAndApprovals(internalCalls, approvals, transfers)

  return { transfers, approvals }

  // Recursively find all the events in functionInvocation with key 0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9
  // and add them to the transfers array
}
