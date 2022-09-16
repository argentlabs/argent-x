import { BigNumber } from "ethers"
import { Call, number, stark } from "starknet"
import useSWR from "swr"

import { getFeeToken } from "../../../shared/token/utils"
import { getEstimatedFee } from "../../services/backgroundTransactions"
import { getUint256CalldataFromBN } from "../../services/transactions"
import { Account } from "../accounts/Account"

const { compileCalldata, estimatedFeeToMaxFee: addOverheadToFee } = stark

export const useMaxFeeEstimateForTransfer = (
  tokenAddress?: string,
  balance?: BigNumber,
  account?: Account,
): {
  maxFee?: string
  error?: any
  loading: boolean
} => {
  if (!account || !balance || !tokenAddress) {
    throw new Error("Account, TokenAddress and Balance are required")
  }

  const call: Call = {
    contractAddress: tokenAddress,
    entrypoint: "transfer",
    calldata: compileCalldata({
      recipient: account.address,
      amount: getUint256CalldataFromBN(balance),
    }),
  }

  const {
    data: estimatedFee,
    error,
    isValidating,
  } = useSWR(
    [
      "maxEthTransferEstimate",
      Math.floor(Date.now() / 60e3),
      account.networkId,
    ],
    async () => {
      const feeToken = getFeeToken(account.networkId)

      if (feeToken?.address !== tokenAddress) {
        return {
          amount: BigNumber.from(0),
          suggestedMaxFee: BigNumber.from(0),
          unit: "wei",
        }
      }

      return await getEstimatedFee(call)
    },
    {
      suspense: false,
      refreshInterval: 15e3,
      shouldRetryOnError: false,
    },
  )

  if (error) {
    return { maxFee: undefined, error, loading: false }
  }

  // Add Overhead to estimatedFee
  if (estimatedFee) {
    const maxFee = addOverheadToFee(
      estimatedFee.suggestedMaxFee.toString(),
      0.2,
    )
    return {
      maxFee: number.toHex(maxFee),
      error: undefined,
      loading: false,
    }
  }

  return { maxFee: undefined, error: undefined, loading: isValidating }
}
