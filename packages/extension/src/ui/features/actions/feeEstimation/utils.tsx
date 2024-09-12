import {
  Address,
  TransactionAction,
  useConditionallyEnabledSWR,
} from "@argent/x-shared"
import { TransactionType, UniversalDeployerContractPayload } from "starknet"
import useSWR from "swr"

import { DeclareContract } from "../../../../shared/udc/schema"
import { ErrorObject } from "../../../../shared/utils/error"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import {
  getAccountDeploymentEstimatedFee,
  getDeclareContractEstimatedFee,
  getDeployContractEstimatedFee,
  getEstimatedFee,
} from "../../../services/backgroundTransactions"
import { EstimatedFee, EstimatedFees } from "@argent/x-shared/simulation"
import { ApiTransactionBulkSimulationResponse } from "../../../../shared/transactionSimulation/types"
import { RefreshIntervalInSeconds } from "../../../../shared/config"
import { isString } from "lodash-es"

interface UseMaxFeeEstimationReturnProps {
  fee: EstimatedFees | undefined
  error: ErrorObject | undefined
}
export const useMaxFeeEstimation = (
  actionHash: string,
  account: BaseWalletAccount,
  transactionAction: TransactionAction,
  feeTokenAddress?: Address,
  transactionSimulation?: ApiTransactionBulkSimulationResponse,
  isSimulationLoading?: boolean,
): UseMaxFeeEstimationReturnProps => {
  const enabled =
    !isSimulationLoading &&
    (!transactionSimulation || transactionSimulation.length === 0) &&
    Boolean(feeTokenAddress)
  const { data: fee, error } = useConditionallyEnabledSWR(
    enabled,
    [actionHash, feeTokenAddress, "feeEstimation"],
    () => {
      // this should never happen, just to make typescript happy
      if (!feeTokenAddress) {
        return
      }
      switch (transactionAction.type) {
        case TransactionType.INVOKE:
          return getEstimatedFee(
            transactionAction.payload,
            account,
            feeTokenAddress,
          )

        case TransactionType.DECLARE:
          return getDeclareContractEstimatedFee({
            payload: transactionAction.payload,
            feeTokenAddress,
            account,
          })

        case TransactionType.DEPLOY:
          return getDeployContractEstimatedFee({
            payload: transactionAction.payload,
            feeTokenAddress,
            account,
          })

        default:
          return
      }
    },
    {
      suspense: false,
      refreshInterval: RefreshIntervalInSeconds.FAST * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error }
}

interface UseMaxAccountDeploymentFeeEstimationReturnProps {
  fee: EstimatedFee | undefined
  error: ErrorObject | undefined
  loading: boolean
}

export const useMaxAccountDeploymentFeeEstimation = (
  account: BaseWalletAccount | undefined,
  actionHash: string,
  feeTokenAddress?: string,
): UseMaxAccountDeploymentFeeEstimationReturnProps => {
  const shouldFetch = Boolean(account) && Boolean(feeTokenAddress)
  const {
    data: fee,
    error,
    isValidating,
  } = useConditionallyEnabledSWR(
    shouldFetch,
    [actionHash, "accountDeploymentFeeEstimation", feeTokenAddress],
    () => {
      if (feeTokenAddress) {
        return getAccountDeploymentEstimatedFee(feeTokenAddress, account)
      }
    },
    {
      suspense: false,
      refreshInterval: RefreshIntervalInSeconds.FAST * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error, loading: !fee && isValidating }
}

export const useMaxDeclareContractFeeEstimation = (
  declareContractPayload: DeclareContract,
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [
      actionHash,
      "declareContractFeeEstimation",
      declareContractPayload.feeTokenAddress,
    ],
    () => getDeclareContractEstimatedFee(declareContractPayload),
    {
      suspense: false,
      refreshInterval: RefreshIntervalInSeconds.FAST * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error }
}

export const useMaxDeployContractFeeEstimation = (
  declareContractPayload: UniversalDeployerContractPayload,
  account: BaseWalletAccount,
  feeTokenAddress: Address,
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [actionHash, "deployContractFeeEstimation"],
    () =>
      getDeployContractEstimatedFee({
        payload: declareContractPayload,
        account,
        feeTokenAddress,
      }),
    {
      suspense: false,
      refreshInterval: RefreshIntervalInSeconds.FAST * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error }
}

type FeeStatus = "loading" | "error" | "success"

export function getCombinedFeeTooltipText(
  maxFee?: bigint,
  feeTokenBalance?: bigint,
): {
  status: FeeStatus
  message: string
} {
  if (!maxFee || !feeTokenBalance) {
    return {
      status: "loading",
      message: "Network fee is still loading.",
    }
  }
  if (feeTokenBalance >= maxFee) {
    return {
      status: "success",
      message:
        "Network fees are paid to the network to include transactions in blocks",
    }
  }
  return {
    status: "error",
    message: `Insufficient balance to pay network fees. You need to add more funds to be able to execute the transaction.`,
  }
}

export function getTooltipText(maxFee?: bigint, feeTokenBalance?: bigint) {
  if (!maxFee || !feeTokenBalance) {
    return "Network fee is still loading."
  }
  if (isString(feeTokenBalance)) {
    // FIXME: this is string '0' if the fee token is not deployed?
    feeTokenBalance = BigInt(feeTokenBalance)
  }
  if (feeTokenBalance >= maxFee) {
    return "Network fees are paid to the network to include transactions in blocks"
  }
  return `Insufficient balance to pay network fees. You need to add more funds to be able to execute the transaction.`
}
