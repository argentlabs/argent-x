import { CallData, TransactionType, uint256 } from "starknet"
import useSWR from "swr"

import type { Address } from "@argent/x-shared"
import {
  estimatedFeesToMaxFeeTotalV2,
  isEqualAddress,
  transferCalldataSchema,
} from "@argent/x-shared"
import { swrRefetchDisabledConfig } from "@argent/x-ui"
import { getEstimatedFee } from "../../services/backgroundTransactions"
import { getReviewForTransactions } from "../actions/transactionV2/useTransactionReviewV2"
import type { WalletAccount } from "../../../shared/wallet.model"
import { useTokenBalancesForFeeEstimates } from "./useFeeTokenBalance"
import { useSimulationFeesWithSubsidiy } from "../actions/transactionV2/useSimulationFeesWithSubsidiy"
import { equalToken } from "../../../shared/token/__new/utils"
import { hasFeeTokenEnoughBalance } from "../actions/transactionV2/utils/hasFeeTokenEnoughBalance"
import { useFeeFromEstimatedFees } from "../actions/transactionV2/useFeeFromEstimatedFees"
import { useNativeFeeToken } from "../actions/useNativeFeeToken"
import type { EnrichedSimulateAndReviewV2 } from "@argent/x-shared/simulation"

const getTransferTransactionReview = async (
  tokenAddress: Address,
  account: WalletAccount,
  feeTokenAddress?: Address,
) => {
  const calldata = CallData.compile(
    transferCalldataSchema.parse({
      recipient: feeTokenAddress ?? tokenAddress, // Doesn't matter for the review
      amount: uint256.bnToUint256(BigInt(1)),
    }),
  )

  const transaction = {
    type: TransactionType.INVOKE,
    payload: {
      contractAddress: tokenAddress,
      entrypoint: "transfer",
      calldata,
    },
  }

  const reviewResult = await getReviewForTransactions({
    transaction,
    selectedAccount: account,
    maxSendEstimate: true,
  })

  return { transaction, reviewResult }
}
export const maxFeeEstimateForTransfer = async (
  feeTokenAddress?: Address,
  tokenAddress?: Address,
  account?: WalletAccount,
) => {
  if (!account || !tokenAddress || !feeTokenAddress) return

  const { transaction, reviewResult } = await getTransferTransactionReview(
    tokenAddress,
    account,
  )

  const feeByToken = reviewResult?.result.enrichedFeeEstimation?.find((fee) =>
    isEqualAddress(fee.transactions.feeTokenAddress, feeTokenAddress),
  )

  const estimatedFee =
    feeByToken ??
    (await getEstimatedFee(transaction.payload, account, feeTokenAddress))

  return estimatedFeesToMaxFeeTotalV2(estimatedFee)
}

export const useMaxFeeEstimateForTransfer = (
  tokenAddress?: Address,
  account?: WalletAccount,
  balance = 0n,
  fetch: boolean = false,
) => {
  const key =
    fetch && account && tokenAddress
      ? [account.id, "maxFeeEstimateForTransferV2", balance]
      : null

  const {
    data: feeEstimates,
    isValidating,
    error,
  } = useSWR<EnrichedSimulateAndReviewV2 | undefined>(
    key,
    async () => {
      if (balance <= 0n || !tokenAddress || !account) {
        return
      }

      const { reviewResult } = await getTransferTransactionReview(
        tokenAddress,
        account,
      )

      return reviewResult?.result
    },
    swrRefetchDisabledConfig,
  )

  const { simulationFees } = useSimulationFeesWithSubsidiy(
    feeEstimates,
    account,
  )

  const feeTokens = useTokenBalancesForFeeEstimates(account, simulationFees)
  const nativeFeeToken = useNativeFeeToken(account)

  const sortedFeeTokens = feeTokens.sort(
    (a, b) =>
      Number(equalToken(b, nativeFeeToken)) -
      Number(equalToken(a, nativeFeeToken)),
  )

  const tokenWithSufficientBalance =
    sortedFeeTokens.find((t) =>
      simulationFees?.some(
        (f) =>
          isEqualAddress(f.transactions.feeTokenAddress, t.address) &&
          hasFeeTokenEnoughBalance(t, f),
      ),
    ) ?? nativeFeeToken

  const fee = useFeeFromEstimatedFees(
    simulationFees,
    tokenWithSufficientBalance,
  )

  const data = {
    maxFee: fee ? estimatedFeesToMaxFeeTotalV2(fee) : 0n,
    feeTokenAddress: tokenWithSufficientBalance.address,
  }

  return { data, isValidating, error }
}
