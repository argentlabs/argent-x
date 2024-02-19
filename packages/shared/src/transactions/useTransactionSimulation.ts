import objectHash from "object-hash"
import { useCallback, useMemo } from "react"
import {
  Account,
  Call,
  CallData,
  DeployAccountContractPayload,
  InvocationsSignerDetails,
  TransactionType,
  hash,
  num,
} from "starknet"
import urlJoin from "url-join"

import { fetchData } from "../http/fetcher"
import {
  swrRefetchDisabledConfig,
  useConditionallyEnabledSWR,
} from "../http/swr"
import { isContractDeployed } from "../utils/isContractDeployed"
import {
  ApiTransactionSimulationResponse,
  IUseTransactionSimulation,
  SimulateDeployAccountRequest,
  SimulateInvokeRequest,
  SimulationError,
} from "./transactionSimulationTypes"

type ISimulateTransactionInvocation = {
  account: Account
  transactions: Call | Call[]
  accountDeployPayload?: DeployAccountContractPayload
}

const simulateTransactionInvocation = async ({
  account,
  transactions,
  accountDeployPayload,
}: ISimulateTransactionInvocation) => {
  try {
    if (!account) {
      throw Error("no accounts")
    }

    const nonce = await account.getNonce()
    const chainId = await account.getChainId()
    const version = num.toHex(hash.feeTransactionVersion)

    const signerDetails: InvocationsSignerDetails = {
      walletAddress: account.address,
      nonce,
      maxFee: 0,
      version,
      chainId,
      cairoVersion: account.cairoVersion,
    }

    let accountDeployTransaction: SimulateDeployAccountRequest | null = null

    const { contractAddress, calldata } = await account.buildInvocation(
      Array.isArray(transactions) ? transactions : [transactions],
      signerDetails,
    )

    const invokeTransactions: SimulateInvokeRequest = {
      type: TransactionType.INVOKE,
      sender_address: contractAddress,
      calldata: CallData.toCalldata(calldata),
      signature: [],
      nonce: !accountDeployPayload ? num.toHex(nonce) : num.toHex(1),
      version,
    }

    // account is not deployed
    if (accountDeployPayload) {
      const accountDeployInvocation = await account.buildAccountDeployPayload(
        accountDeployPayload,
        signerDetails,
      )

      accountDeployTransaction = {
        type: TransactionType.DEPLOY_ACCOUNT as const,
        calldata: CallData.toCalldata(
          accountDeployInvocation.constructorCalldata,
        ),
        classHash: num.toHex(accountDeployInvocation.classHash),
        salt: num.toHex(accountDeployInvocation.addressSalt || 0),
        nonce: num.toHex(0),
        version: num.toHex(version),
        signature: [],
      }
    }

    return {
      transactions: accountDeployTransaction
        ? [accountDeployTransaction, invokeTransactions]
        : [invokeTransactions],
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
  accountDeployPayload,
  transactions,
  provider,
  transactionSimulationEnabled = true,
}: IUseTransactionSimulation) => {
  const transactionSimulationFetcher = useCallback(async () => {
    if (!account) {
      return
    }

    const isDeployed = await isContractDeployed(provider, account.address)

    try {
      const { apiBaseUrl, apiHeaders } = apiData
      if (!apiBaseUrl) {
        throw "Transaction simulation endpoint is not defined"
      }

      const ARGENT_TRANSACTION_SIMULATION_URL = urlJoin(
        apiBaseUrl,
        "starknet/bulkSimulate",
      )

      // pass deploy payload only if the account is not deployed
      const conditionalAccountDeployPayload =
        !isDeployed && accountDeployPayload ? accountDeployPayload : undefined

      const { transactions: invocation, chainId } =
        await simulateTransactionInvocation({
          account,
          transactions,
          accountDeployPayload: conditionalAccountDeployPayload,
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
            transactions: invocation,
            chainId,
          }),
        },
      )
      return backendSimulation.simulationResults
    } catch (e) {
      /** Disable client-side simulation
      // console.error("Failed to fetch transaction simulation from backend", e)
      // console.warn("Falling back to client-side simulation")
      // return doTransactionSimulation({ account, transactions })
      */
      if ((e as SimulationError).status >= 500) {
        console.error("Failed to fetch transaction simulation from backend", e)
        console.warn("Falling back to client-side simulation")
        return undefined
      }
      throw new Error(
        `Failed to fetch transaction simulation from backend: ${e} `,
      )
    }
  }, [account, transactions])

  const hash = useMemo(() => objectHash({ transactions }), [transactions])

  return useConditionallyEnabledSWR<
    ApiTransactionSimulationResponse[] | undefined
  >(
    Boolean(transactionSimulationEnabled),
    [hash, "transactionSimulation"],
    transactionSimulationFetcher,
    swrRefetchDisabledConfig,
  )
}

export const useTxFeesPreprocessor = (
  transactionSimulation?: ApiTransactionSimulationResponse[],
) => {
  return useMemo(() => {
    if (!transactionSimulation) {
      return null
    }

    const { feeEstimation } = transactionSimulation.reduce<
      Pick<ApiTransactionSimulationResponse, "feeEstimation">
    >(
      (acc, tx) => {
        const gasPrice =
          num.toBigInt(acc.feeEstimation?.gasPrice ?? 0) +
          num.toBigInt(tx.feeEstimation?.gasPrice ?? 0)
        const gasUsage =
          num.toBigInt(acc.feeEstimation?.gasUsage ?? 0) +
          num.toBigInt(tx.feeEstimation?.gasUsage ?? 0)
        const overallFee =
          num.toBigInt(acc.feeEstimation?.overallFee ?? 0) +
          num.toBigInt(tx.feeEstimation?.overallFee ?? 0)

        return {
          feeEstimation: {
            gasPrice,
            gasUsage,
            overallFee,
            unit: tx.feeEstimation?.unit ?? "WEI",
          },
        }
      },
      {
        feeEstimation: {
          gasPrice: num.toBigInt(0),
          gasUsage: num.toBigInt(0),
          overallFee: num.toBigInt(0),
          unit: "WEI",
        },
      },
    )
    return feeEstimation
  }, [transactionSimulation])
}
