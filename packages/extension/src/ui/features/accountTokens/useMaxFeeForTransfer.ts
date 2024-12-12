import { CallData, TransactionType, uint256 } from "starknet"
import useSWR from "swr"

import type { Address } from "@argent/x-shared"
import {
  estimatedFeesToMaxFeeTotal,
  transferCalldataSchema,
} from "@argent/x-shared"
import { swrRefetchDisabledConfig } from "@argent/x-ui"
import { getEstimatedFee } from "../../services/backgroundTransactions"
import type { Account } from "../accounts/Account"
import { getReviewForTransactions } from "../actions/transactionV2/useTransactionReviewV2"

export const maxFeeEstimateForTransfer = async (
  feeTokenAddress?: Address,
  tokenAddress?: Address,
  account?: Pick<
    Account,
    "id" | "address" | "networkId" | "needsDeploy" | "classHash" | "type"
  >,
) => {
  if (!account || !tokenAddress || !feeTokenAddress) return

  const calldata = CallData.compile(
    transferCalldataSchema.parse({
      recipient: feeTokenAddress,
      amount: uint256.bnToUint256(BigInt(1)),
    }),
  )

  const transaction = {
    type: TransactionType.INVOKE as const,
    payload: {
      contractAddress: tokenAddress,
      entrypoint: "transfer",
      calldata,
    },
  }

  const reviewResult = await getReviewForTransactions({
    transaction,
    feeTokenAddress,
    selectedAccount: account,
    maxSendEstimate: true,
  })

  const estimatedFee =
    reviewResult?.result.enrichedFeeEstimation ??
    (await getEstimatedFee(transaction.payload, account, feeTokenAddress))

  return estimatedFeesToMaxFeeTotal(estimatedFee)
}

export const useMaxFeeEstimateForTransfer = (
  feeTokenAddress?: Address,
  tokenAddress?: Address,
  account?: Pick<
    Account,
    "id" | "address" | "networkId" | "needsDeploy" | "classHash" | "type"
  >,
  balance = 0n,
  fetch: boolean = false,
) => {
  const key =
    fetch && account && tokenAddress
      ? [account.id, "maxFeeEstimateForTransferV2", feeTokenAddress, balance]
      : null

  return useSWR<bigint | undefined>(
    key,
    async () =>
      balance > 0n
        ? maxFeeEstimateForTransfer(feeTokenAddress, tokenAddress, account)
        : balance,
    swrRefetchDisabledConfig,
  )
}
