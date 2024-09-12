import { BigNumberish, Call } from "starknet"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { EstimatedFees } from "@argent/x-shared/simulation"

import useSWR from "swr"
import { getAccountIdentifier } from "@argent/x-shared"
import { clientTransactionReviewService } from "../../../services/transactionReview"
import { useRef } from "react"

export const useAirGapData = (
  account: BaseWalletAccount | undefined,
  transactions: Call | Call[],
  estimatedFees?: EstimatedFees,
  nonce?: BigNumberish,
) => {
  // This make sures that we don't use a cached value when the component is mounted
  const cacheBust = useRef(Date.now())
  return useSWR(
    account
      ? [
          "getAirGapData",
          cacheBust,
          getAccountIdentifier(account),
          transactions,
          estimatedFees,
        ]
      : null,
    () =>
      account &&
      clientTransactionReviewService.getCompressedTransactionPayload(
        account,
        transactions,
        estimatedFees,
        nonce?.toString(),
      ),
  )
}
