import { BigNumberish, Call } from "starknet"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { EstimatedFees } from "@argent/x-shared/simulation"

import useSWR from "swr/immutable"
import { getAccountIdentifier } from "@argent/x-shared"
import { clientTransactionReviewService } from "../../../services/transactionReview"
import { useRef } from "react"

export const useTransactionHash = (
  account: BaseWalletAccount | undefined,
  transactions?: Call | Call[],
  estimatedFees?: EstimatedFees,
  nonce?: BigNumberish,
) => {
  // This make sures that we don't use a cached value when the component is mounted
  const cacheBust = useRef(Date.now())
  return useSWR(
    account
      ? [
          "getTransactionHash",
          cacheBust,
          getAccountIdentifier(account),
          transactions,
          estimatedFees,
          nonce,
        ]
      : null,
    () =>
      account &&
      transactions &&
      clientTransactionReviewService.getTransactionHash(
        account,
        transactions,
        estimatedFees,
        nonce,
      ),
  )
}
