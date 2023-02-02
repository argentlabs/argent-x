import { Call } from "starknet"

import { ARGENT_TRANSACTION_SIMULATION_URL } from "./api/constants"
import { Fetcher, fetcher } from "./api/fetcher"
import { sendMessage, waitForMessage } from "./messages"
import { AllowArray } from "./storage/types"

export interface IFetchTransactionSimulation {
  transactions: AllowArray<Call>
  fetcher?: Fetcher
}

export const fetchTransactionSimulation = async ({
  transactions,
  fetcher: fetcherImpl = fetcher,
}: IFetchTransactionSimulation) => {
  if (!ARGENT_TRANSACTION_SIMULATION_URL) {
    throw "Transaction simulation endpoint is not defined"
  }

  sendMessage({
    type: "SIMULATE_TRANSACTION",
    data: transactions,
  })

  const data = await Promise.race([
    waitForMessage("SIMULATE_TRANSACTION_RES"),
    waitForMessage("SIMULATE_TRANSACTION_REJ"),
  ])

  if ("error" in data) {
    throw data.error
  }

  return fetcherImpl(ARGENT_TRANSACTION_SIMULATION_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
}

export interface TokenDetails {
  decimals: string
  symbol: string
  name: string
  tokenURI: string | null
  tokenType: "erc20" | "erc721" | "erc1155"
  usdValue: string | null
}

export interface TransactionSimulationApproval {
  tokenAddress: string
  owner: string
  spender: string
  value: string
  details: TokenDetails
}

export interface TransactionSimulationTransfer {
  tokenAddress: string
  from: string
  to: string
  value: string
  details: TokenDetails
}

export interface ApiTransactionSimulationResponse {
  approvals: TransactionSimulationApproval[]
  transfers: TransactionSimulationTransfer[]
}
