import { TransactionType } from "starknet"
import useSWR from "swr"

import type { Address, StakerInfo } from "@argent/x-shared"
import {
  addressSchema,
  estimatedFeesToMaxFeeTotalV2,
  getNativeEstimatedFeeByFeeToken,
} from "@argent/x-shared"
import { swrRefetchDisabledConfig } from "@argent/x-ui"
import { getReviewForTransactions } from "../../../actions/transactionV2/useTransactionReviewV2"
import { getEstimatedFee } from "../../../../services/backgroundTransactions"
import { stakingService } from "../../../../services/staking"
import type { WalletAccount } from "../../../../../shared/wallet.model"

export const maxFeeEstimateForStaking = async ({
  feeTokenAddress,
  tokenAddress,
  account,
  balance = 0n,
  stakerInfo,
  investmentId,
}: {
  feeTokenAddress?: Address
  tokenAddress?: Address
  account?: Pick<
    WalletAccount,
    "id" | "address" | "networkId" | "needsDeploy" | "classHash" | "type"
  >
  balance: bigint
  stakerInfo?: StakerInfo
  investmentId?: string
}) => {
  if (
    !feeTokenAddress ||
    !tokenAddress ||
    !account ||
    !investmentId ||
    !stakerInfo
  ) {
    return
  }

  const accountAddress = addressSchema.parse(account.address)

  const { calls } = await stakingService.getStakeCalldata({
    amount: balance.toString(),
    tokenAddress,
    stakerInfo,
    investmentId,
    accountAddress,
  })

  const transaction = {
    type: TransactionType.INVOKE,
    payload: calls,
  }

  const reviewResult = await getReviewForTransactions({
    transaction,
    selectedAccount: account,
    maxSendEstimate: true,
  })

  const estimatedFee = reviewResult?.result.enrichedFeeEstimation
    ? getNativeEstimatedFeeByFeeToken(
        reviewResult?.result.enrichedFeeEstimation,
        feeTokenAddress,
      )
    : await getEstimatedFee(calls, account, feeTokenAddress)

  return estimatedFeesToMaxFeeTotalV2(estimatedFee)
}

export const useMaxFeeForStaking = ({
  feeTokenAddress,
  tokenAddress,
  account,
  balance = 0n,
  fetch = false,
  stakerInfo,
  investmentId,
}: {
  feeTokenAddress?: Address
  tokenAddress?: Address
  account?: Pick<
    WalletAccount,
    "id" | "address" | "networkId" | "needsDeploy" | "classHash" | "type"
  >
  balance: bigint
  fetch: boolean
  stakerInfo?: StakerInfo
  investmentId?: string
}) => {
  const shouldFetch =
    fetch &&
    account &&
    tokenAddress &&
    stakerInfo &&
    investmentId &&
    feeTokenAddress
  const key = shouldFetch
    ? [
        account.id,
        "maxFeeEstimateForStaking",
        feeTokenAddress,
        balance,
        tokenAddress,
        stakerInfo,
        investmentId,
      ]
    : null

  return useSWR<bigint | undefined>(
    key,
    async () =>
      balance > 0n
        ? maxFeeEstimateForStaking({
            feeTokenAddress,
            tokenAddress,
            account,
            balance,
            stakerInfo,
            investmentId,
          })
        : balance,
    swrRefetchDisabledConfig,
  )
}
