import { BigNumber, utils } from "ethers"
import { Call } from "starknet"
import useSWR from "swr"

import { getEstimatedFee } from "../../../services/backgroundTransactions"

export const useMaxFeeEstimation = (
  transactions: Call | Call[],
  actionHash: string,
) => {
  const { data: fee, error } = useSWR(
    [actionHash, "feeEstimation"],
    () => getEstimatedFee(transactions),
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
