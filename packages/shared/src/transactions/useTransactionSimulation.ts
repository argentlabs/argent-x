import objectHash from "object-hash"
import { useCallback } from "react"
import { useMemo } from "react"
import { Account, Call, InvocationsSignerDetails, hash, number } from "starknet"
import urlJoin from "url-join"

import { fetchData } from "../http/fetcher"
import { useConditionallyEnabledSWR } from "../http/swr"
import { isContractDeployed } from "../utils/isContractDeployed"
import { findTransfersAndApprovals } from "./findTransfersAndApprovals"
import {
  ApiTransactionSimulationResponse,
  IUseTransactionSimulation,
  TransactionSimulationApproval,
  TransactionSimulationTransfer,
} from "./transactionSimulationTypes"

type ISimulateTransactionInvocation = {
  account: Account
  transactions: Call | Call[]
}

const doTransactionSimulation = async ({
  account,
  transactions,
}: ISimulateTransactionInvocation) => {
  const nonce = await account.getNonce()
  let simulated = null
  const transfers: TransactionSimulationTransfer[] = []
  const approvals: TransactionSimulationApproval[] = []

  try {
    simulated = await account.simulateTransaction(transactions, {
      nonce,
    })
  } catch (error) {
    console.error(error)
    return { transfers, approvals }
  }
  const internalCalls = simulated.trace.function_invocation?.internal_calls

  if (!internalCalls) {
    return { transfers, approvals }
  }

  findTransfersAndApprovals(internalCalls, approvals, transfers)
  return { transfers, approvals }
}

const simulateTransactionInvocation = async ({
  account,
  transactions,
}: ISimulateTransactionInvocation) => {
  try {
    if (!account) {
      throw Error("no accounts")
    }

    const nonce = await account.getNonce()
    const chainId = account.chainId
    const version = number.toHex(hash.feeTransactionVersion)

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: account.address,
      nonce,
      maxFee: 0,
      version,
      chainId,
    }

    const { contractAddress, calldata, signature } =
      await account.buildInvocation(
        Array.isArray(transactions) ? transactions : [transactions],
        signerDetails,
      )

    const invocation = {
      type: "INVOKE_FUNCTION" as const,
      contract_address: contractAddress,
      calldata,
      signature,
      nonce,
      version,
    }

    return {
      invocation,
      chainId,
    }
  } catch (error) {
    console.error(error)
    throw Error(
      (error as any)?.message?.toString() ??
        (error as any)?.toString() ??
        "Unkown error",
    )
  }
}

export const useTransactionSimulation = ({
  apiData,
  account,
  transactions,
  provider,
  transactionSimulationEnabled = true,
}: IUseTransactionSimulation) => {
  const transactionSimulationFetcher = useCallback(async () => {
    if (!account) {
      return
    }

    const isDeployed = await isContractDeployed(provider, account.address)
    if (!isDeployed) {
      // TODO: handle account deployment
      return
    }

    try {
      const { apiBaseUrl, apiHeaders } = apiData
      if (!apiBaseUrl) {
        throw "Transaction simulation endpoint is not defined"
      }

      const ARGENT_TRANSACTION_SIMULATION_URL = urlJoin(
        apiBaseUrl,
        "starknet/simulate",
      )

      const { invocation, chainId } = await simulateTransactionInvocation({
        account,
        transactions,
      })

      const backendSimulation = await fetchData(
        ARGENT_TRANSACTION_SIMULATION_URL,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...apiHeaders,
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

      return doTransactionSimulation({ account, transactions })
    }
  }, [account, transactions])

  const hash = useMemo(() => objectHash({ transactions }), [transactions])

  return useConditionallyEnabledSWR<ApiTransactionSimulationResponse>(
    Boolean(transactionSimulationEnabled),
    [hash, "transactionSimulation"],
    transactionSimulationFetcher,
    {
      revalidateOnFocus: false,
    },
  )
}
