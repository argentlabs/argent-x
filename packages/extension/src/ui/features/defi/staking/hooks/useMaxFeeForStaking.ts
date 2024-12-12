import { TransactionType } from "starknet"
import useSWR from "swr"

import type { Address, StakerInfo } from "@argent/x-shared"
import { addressSchema } from "@argent/x-shared"
import { estimatedFeesToMaxFeeTotal } from "@argent/x-shared"
import { swrRefetchDisabledConfig } from "@argent/x-ui"
import type { Account } from "../../../accounts/Account"
import { getReviewForTransactions } from "../../../actions/transactionV2/useTransactionReviewV2"
import { getEstimatedFee } from "../../../../services/backgroundTransactions"
import { stakingService } from "../../../../services/staking"

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
    Account,
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
    type: TransactionType.INVOKE as const,
    payload: calls,
  }

  const reviewResult = await getReviewForTransactions({
    transaction,
    feeTokenAddress,
    selectedAccount: account,
    maxSendEstimate: true,
  })

  const estimatedFee =
    reviewResult?.result.enrichedFeeEstimation ??
    (await getEstimatedFee(calls, account, feeTokenAddress))

  return estimatedFeesToMaxFeeTotal(estimatedFee)
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
    Account,
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
