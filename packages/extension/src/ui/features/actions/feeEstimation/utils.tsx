import { bigDecimal, useConditionallyEnabledSWR } from "@argent/shared"
import { Call, UniversalDeployerContractPayload } from "starknet"
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
  transactions: Call | Call[],
  transactionSimulation?: ApiTransactionBulkSimulationResponse,
  isSimulationLoading?: boolean,
): UseMaxFeeEstimationReturnProps => {
  const { data: fee, error } = useConditionallyEnabledSWR(
    !isSimulationLoading &&
      (!transactionSimulation || transactionSimulation.length === 0),
    [actionHash, "feeEstimation"],
    () => transactions && getEstimatedFee(transactions, account),
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
}

export const useMaxAccountDeploymentFeeEstimation = (
  account: BaseWalletAccount | undefined,
  actionHash: string,
): UseMaxAccountDeploymentFeeEstimationReturnProps => {
  const { data: fee, error } = useSWR(
    [actionHash, "accountDeploymentFeeEstimation"],
    () => getAccountDeploymentEstimatedFee(account),
    {
      suspense: false,
      refreshInterval: RefreshInterval.FAST * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error }
}

export const useMaxDeclareContractFeeEstimation = (
  declareContractPayload: DeclareContract,
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [actionHash, "declareContractFeeEstimation"],
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
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [actionHash, "deployContractFeeEstimation"],
    () => getDeployContractEstimatedFee(declareContractPayload),
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
