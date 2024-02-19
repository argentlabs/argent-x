import {
  Address,
  TransactionAction,
  bigDecimal,
  useConditionallyEnabledSWR,
} from "@argent/shared"
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
import {
  EstimatedFee,
  EstimatedFees,
} from "../../../../shared/transactionSimulation/fees/fees.model"
import { ApiTransactionBulkSimulationResponse } from "../../../../shared/transactionSimulation/types"
import { RefreshInterval } from "../../../../shared/config"

interface UseMaxFeeEstimationReturnProps {
  fee: EstimatedFees | undefined
  error: ErrorObject | undefined
}
export const useMaxFeeEstimation = (
  actionHash: string,
  account: BaseWalletAccount,
  transactionAction: TransactionAction,
  feeTokenAddress: Address,
  transactionSimulation?: ApiTransactionBulkSimulationResponse,
  isSimulationLoading?: boolean,
): UseMaxFeeEstimationReturnProps => {
  const { data: fee, error } = useConditionallyEnabledSWR(
    !isSimulationLoading &&
      (!transactionSimulation || transactionSimulation.length === 0),
    [actionHash, feeTokenAddress, "feeEstimation"],
    () => {
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
      refreshInterval: RefreshInterval.FAST * 1000, // 20 seconds
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
  feeTokenAddress: string,
): UseMaxAccountDeploymentFeeEstimationReturnProps => {
  const {
    data: fee,
    error,
    isValidating,
  } = useSWR(
    [actionHash, "accountDeploymentFeeEstimation", feeTokenAddress],
    () => getAccountDeploymentEstimatedFee(feeTokenAddress, account),
    {
      suspense: false,
      refreshInterval: RefreshInterval.FAST * 1000, // 20 seconds
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
      refreshInterval: RefreshInterval.FAST * 1000, // 20 seconds
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
      refreshInterval: RefreshInterval.FAST * 1000, // 20 seconds
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
    message: `Insufficient balance to pay network fees. You need at least ${bigDecimal.formatEther(
      maxFee - feeTokenBalance,
    )} ETH more.`,
  }
}

export function getTooltipText(maxFee?: bigint, feeTokenBalance?: bigint) {
  if (!maxFee || !feeTokenBalance) {
    return "Network fee is still loading."
  }
  if (feeTokenBalance >= maxFee) {
    return "Network fees are paid to the network to include transactions in blocks"
  }
  return `Insufficient balance to pay network fees. You need at least ${bigDecimal.formatEther(
    maxFee - feeTokenBalance,
  )} ETH more.`
}
