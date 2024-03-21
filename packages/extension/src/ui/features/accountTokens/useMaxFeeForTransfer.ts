import { Call, CallData, uint256 } from "starknet"
import useSWR from "swr"

import { getAccountIdentifier } from "../../../shared/wallet.service"
import {
  getEstimatedFee,
  getSimulationEstimatedFee,
} from "../../services/backgroundTransactions"
import { Account } from "../accounts/Account"
import {
  Address,
  isEqualAddress,
  swrRefetchDisabledConfig,
  transferCalldataSchema,
} from "@argent/x-shared"
import { estimatedFeesToMaxFeeTotal } from "../../../shared/transactionSimulation/utils"

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
  if (!isEqualAddress(tokenAddress, feeTokenAddress)) {
    return 0n
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
    (await getSimulationEstimatedFee(calls, feeTokenAddress)) ??
    (await getEstimatedFee(calls, account, feeTokenAddress))
  return estimatedFeesToMaxFeeTotal(estimatedFee)
}

export const useMaxFeeEstimateForTransfer = (
  feeTokenAddress?: Address,
  tokenAddress?: Address,
  account?: Pick<
    Account,
    "address" | "networkId" | "needsDeploy" | "classHash" | "type"
  >,
  balance = 0n,
) => {
  const key =
    account && tokenAddress
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
