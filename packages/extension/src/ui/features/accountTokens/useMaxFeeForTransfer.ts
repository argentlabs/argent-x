import { BigNumber } from "ethers"
import { Call, number, stark } from "starknet"
import useSWR from "swr"

import { getNetworkFeeToken } from "../../../shared/tokens.state"
import { getAccountIdentifier } from "../../../shared/wallet.service"
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
  const key =
    account && balance && tokenAddress
      ? [getAccountIdentifier(account), "maxEthTransferEstimate"]
      : null

  const {
    data: estimatedFee,
    error,
    isValidating,
  } = useSWR(
    key,
    async () => {
      if (!account || !balance || !tokenAddress) {
        return
      }
      const feeToken = await getNetworkFeeToken(account.networkId)

      if (feeToken?.address !== tokenAddress) {
        return {
          amount: "0",
          suggestedMaxFee: "0",
        }
      }

      const call: Call = {
        contractAddress: tokenAddress,
        entrypoint: "transfer",
        calldata: compileCalldata({
          recipient: account.address,
          amount: getUint256CalldataFromBN(balance),
        }),
      }

      const estimatedFee = await getEstimatedFee(call)
      return estimatedFee
    },
    {
      refreshInterval: 15 * 1000 /** 15 seconds */,
    },
  )

  if (error) {
    return { maxFee: undefined, error, loading: isValidating }
  }

  // Add Overhead to estimatedFee
  if (estimatedFee && account) {
    const { suggestedMaxFee, maxADFee } = estimatedFee

    const totalMaxFee =
      account.needsDeploy && maxADFee
        ? number.toHex(number.toBN(maxADFee).add(number.toBN(suggestedMaxFee)))
        : suggestedMaxFee

    const maxFee = addOverheadToFee(totalMaxFee, 0.2)

    return {
      maxFee: number.toHex(maxFee),
      error: undefined,
      loading: isValidating,
    }
  }

  return { maxFee: undefined, error: undefined, loading: isValidating }
}
