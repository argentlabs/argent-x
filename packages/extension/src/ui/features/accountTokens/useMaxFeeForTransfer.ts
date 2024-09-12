import { Call, CallData, uint256 } from "starknet"
import useSWR from "swr"

import {
  Address,
  estimatedFeesToMaxFeeTotal,
  multiplyBigIntByFloat,
  swrRefetchDisabledConfig,
  transferCalldataSchema,
} from "@argent/x-shared"
import { getAccountIdentifier } from "../../../shared/wallet.service"
import { getEstimatedFee } from "../../services/backgroundTransactions"
import { Account } from "../accounts/Account"
import { getReviewForTransactions } from "../actions/transactionV2/useTransactionReviewV2"

export const maxFeeEstimateForTransfer = async (
  feeTokenAddress?: Address,
  tokenAddress?: Address,
  account?: Pick<
    Account,
    "address" | "networkId" | "needsDeploy" | "classHash" | "type"
  >,
) => {
  if (!account || !tokenAddress || !feeTokenAddress) {
    return
  }

  const calls: Call[] = [
    {
      contractAddress: tokenAddress,
      entrypoint: "transfer",
      calldata: CallData.compile(
        transferCalldataSchema.parse({
          // We are using a dummy address (ETH here) as recipient to estimate the fee given we don't have a receipient yet
          recipient: feeTokenAddress,
          // We are using the smallest possible amount to make sure this doesn't throw an error
          amount: uint256.bnToUint256(BigInt(1)),
        }),
      ),
    },
  ]

  const estimatedFee =
    (
      await getReviewForTransactions({
        calls,
        feeTokenAddress,
        selectedAccount: account,
      })
    )?.result.enrichedFeeEstimation ??
    (await getEstimatedFee(calls, account, feeTokenAddress))

  // We add 10% overhead to make sure the estimate is still valid in the simulation
  return multiplyBigIntByFloat(estimatedFeesToMaxFeeTotal(estimatedFee), 1.1)
}

export const useMaxFeeEstimateForTransfer = (
  feeTokenAddress?: Address,
  tokenAddress?: Address,
  account?: Pick<
    Account,
    "address" | "networkId" | "needsDeploy" | "classHash" | "type"
  >,
  balance = 0n,
  fetch: boolean = false,
) => {
  const key =
    fetch && account && tokenAddress
      ? [
          getAccountIdentifier(account),
          "maxFeeEstimateForTransferV2",
          feeTokenAddress,
          balance,
        ]
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
