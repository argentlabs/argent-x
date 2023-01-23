import { BigNumber } from "ethers"
import { Call, number, stark } from "starknet"
import useSWR from "swr"

import { getEstimatedFee } from "../../services/backgroundTransactions"
import { getUint256CalldataFromBN } from "../../services/transactions"
import { Account } from "../accounts/Account"
import { getNetworkFeeToken } from "./tokens.state"

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
      const feeToken = await getNetworkFeeToken(account.networkId)

      if (feeToken?.address !== tokenAddress) {
        return {
          amount: "0",
          suggestedMaxFee: "0",
        }
      }

      return getEstimatedFee(call)
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
    const { suggestedMaxFee, maxADFee } = estimatedFee

    const totalMaxFee =
      account.needsDeploy && maxADFee
        ? number.toHex(
            number.toBigInt(maxADFee) + number.toBigInt(suggestedMaxFee),
          )
        : suggestedMaxFee

    const maxFee = addOverheadToFee(totalMaxFee, 0.2)

    return {
      maxFee: number.toHex(maxFee),
      error: undefined,
      loading: false,
    }
  }

  return { maxFee: undefined, error: undefined, loading: isValidating }
}
