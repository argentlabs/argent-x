import { BigNumber, utils } from "ethers"
import { Call, UniversalDeployerContractPayload } from "starknet"
import useSWR from "swr"

import { DeclareContract } from "../../../../shared/udc/type"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import {
  getAccountDeploymentEstimatedFee,
  getDeclareContractEstimatedFee,
  getDeployContractEstimatedFee,
  getEstimatedFee,
} from "../../../services/backgroundTransactions"

export const useMaxFeeEstimation = (
  transactions: Call | Call[],
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [actionHash, "feeEstimation"],
    () => transactions && getEstimatedFee(transactions),
    {
      suspense: false,
      refreshInterval: 20 * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error }
}

export const useMaxAccountDeploymentFeeEstimation = (
  account: BaseWalletAccount | undefined,
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [actionHash, "accountDeploymentFeeEstimation"],
    () => getAccountDeploymentEstimatedFee(account),
    {
      suspense: false,
      refreshInterval: 20 * 1000, // 20 seconds
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
      refreshInterval: 20 * 1000, // 20 seconds
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
      refreshInterval: 20 * 1000, // 20 seconds
      shouldRetryOnError: false,
    },
  )
  return { fee, error }
}

export const getParsedError = (errorTxt: string) => {
  try {
    const regex = new RegExp("Error in the called contract", "g")
    const matchAll = [...errorTxt.matchAll(regex)]
    return errorTxt.slice(matchAll[1].index)
  } catch {
    return errorTxt
  }
}

type FeeStatus = "loading" | "error" | "success"

export function getCombinedFeeTooltipText(
  maxFee?: string,
  feeTokenBalance?: BigNumber,
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
  if (feeTokenBalance.gte(maxFee)) {
    return {
      status: "success",
      message:
        "Network fees are paid to the network to include transactions in blocks",
    }
  }
  return {
    status: "error",
    message: `Insufficient balance to pay network fees. You need at least ${utils.formatEther(
      BigNumber.from(maxFee).sub(feeTokenBalance),
    )} ETH more.`,
  }
}

export function getTooltipText(maxFee?: string, feeTokenBalance?: BigNumber) {
  if (!maxFee || !feeTokenBalance) {
    return "Network fee is still loading."
  }
  if (feeTokenBalance.gte(maxFee)) {
    return "Network fees are paid to the network to include transactions in blocks"
  }
  return `Insufficient balance to pay network fees. You need at least ${utils.formatEther(
    BigNumber.from(maxFee).sub(feeTokenBalance),
  )} ETH more.`
}
