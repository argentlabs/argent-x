import { Call, CallData, num, stark, uint256 } from "starknet"
import useSWR from "swr"

import { getAccountIdentifier } from "../../../shared/wallet.service"
import {
  getEstimatedFeeFromSequencer,
  getSimulationEstimatedFee,
} from "../../services/backgroundTransactions"
import { Account } from "../accounts/Account"
import { useNetworkFeeToken } from "./tokens.state"
import { swrRefetchDisabledConfig } from "@argent/shared"

const { estimatedFeeToMaxFee: addOverheadToFee } = stark

export const useMaxFeeEstimateForTransfer = (
  tokenAddress?: string,
  balance?: bigint,
  account?: Pick<Account, "address" | "networkId" | "needsDeploy">,
): {
  maxFee?: string
  error?: any
  loading: boolean
} => {
  const key =
    account && balance && tokenAddress
      ? [getAccountIdentifier(account), "maxEthTransferEstimate"]
      : null

  const feeToken = useNetworkFeeToken(account?.networkId)

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

      if (feeToken?.address !== tokenAddress) {
        return {
          amount: "0",
          suggestedMaxFee: "0",
        }
      }

      const call: Call = {
        contractAddress: tokenAddress,
        entrypoint: "transfer",
        calldata: CallData.compile({
          // We are using a dummy address (ETH here) as recipient to estimate the fee given we don't have a receipient yet
          recipient: feeToken.address,
          // We are using the smallest possible amount to make sure this doesn't throw an error
          amount: uint256.bnToUint256(BigInt(1)),
        }),
      }

      const estimatedFeeFromSimulation = await getSimulationEstimatedFee(call)
      if (!estimatedFeeFromSimulation) {
        const estimatedFeeFromSequencer = await getEstimatedFeeFromSequencer(
          call,
        )

        return estimatedFeeFromSequencer
      }

      return estimatedFeeFromSimulation
    },
    swrRefetchDisabledConfig,
  )

  if (error) {
    return { maxFee: undefined, error, loading: isValidating }
  }

  // Add Overhead to estimatedFee
  if (estimatedFee && account) {
    const { suggestedMaxFee, maxADFee } = estimatedFee

    const totalMaxFee =
      account.needsDeploy && maxADFee
        ? num.toHex(num.toBigInt(maxADFee) + num.toBigInt(suggestedMaxFee))
        : suggestedMaxFee

    const maxFee = addOverheadToFee(totalMaxFee, 0.2)

    return {
      maxFee: num.toHex(maxFee),
      error: undefined,
      loading: isValidating,
    }
  }

  return { maxFee: undefined, error: undefined, loading: isValidating }
}
