import { Call, CallData, num, uint256 } from "starknet"
import useSWR from "swr"

import { getAccountIdentifier } from "../../../shared/wallet.service"
import {
  getEstimatedFee,
  getSimulationEstimatedFee,
} from "../../services/backgroundTransactions"
import { Account } from "../accounts/Account"
import {
  Hex,
  isEqualAddress,
  swrRefetchDisabledConfig,
  transferCalldataSchema,
} from "@argent/shared"
import { estimatedFeesToMaxFeeTotal } from "../../../shared/transactionSimulation/utils"

export const useMaxFeeEstimateForTransfer = (
  feeTokenAddress?: string,
  tokenAddress?: string,
  balance?: bigint,
  account?: Pick<Account, "address" | "networkId" | "needsDeploy">,
) => {
  const key =
    account && balance !== undefined && tokenAddress
      ? [getAccountIdentifier(account), "maxFeeEstimateForTransfer"]
      : null

  return useSWR<Hex | undefined>(
    key,
    async () => {
      if (
        !account ||
        balance === undefined ||
        !tokenAddress ||
        !feeTokenAddress
      ) {
        return
      }
      if (!isEqualAddress(tokenAddress, feeTokenAddress)) {
        return "0x0" as Hex
      }

      const call: Call = {
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
      }

      const estimatedFee =
        (await getSimulationEstimatedFee(call)) ??
        (await getEstimatedFee(call, account, feeTokenAddress))

      const maxFeeTotal = estimatedFeesToMaxFeeTotal(estimatedFee)
      return num.toHex(maxFeeTotal) as Hex
    },
    swrRefetchDisabledConfig,
  )
}
