import type { BigNumberish, Call } from "starknet"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import type {
  EstimatedFees,
  EstimatedFeesV2,
} from "@argent/x-shared/simulation"

import useSWR from "swr"
import { clientTransactionReviewService } from "../../../services/transactionReview"
import { useRef } from "react"

export const useAirGapData = (
  account: BaseWalletAccount | undefined,
  transactions: Call | Call[],
  estimatedFees?: EstimatedFeesV2,
  nonce?: BigNumberish,
) => {
  // This make sures that we don't use a cached value when the component is mounted
  const cacheBust = useRef(Date.now())
  return useSWR(
    account
      ? ["getAirGapData", cacheBust, account.id, transactions, estimatedFees]
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
