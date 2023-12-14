import { useCallback } from "react"
import useSWRImmutable from "swr/immutable"

import { TransactionReviewTransactions } from "../../../../shared/transactionReview/interface"
import { clientTransactionReviewService } from "../../../services/transactionReview"
import { useView } from "../../../views/implementation/react"
import { selectedAccountView } from "../../../views/account"
import { Call } from "starknet"
import { isArray } from "lodash-es"
import { clientAccountService } from "../../../services/account"

export interface IUseTransactionReviewV2 {
  calls: Call | Call[]
  actionHash: string
}

export const useTransactionReviewV2 = ({
  calls,
  actionHash,
}: IUseTransactionReviewV2) => {
  const currentAccount = useView(selectedAccountView)

  const transactionReviewFetcher = useCallback(async () => {
    const invokeTransactions: TransactionReviewTransactions = {
      type: "INVOKE",
      calls: isArray(calls) ? calls : [calls],
    }

    const accountDeployTransaction = currentAccount?.needsDeploy
      ? await clientAccountService.getAccountDeploymentPayload(currentAccount)
      : null

    const transactions = accountDeployTransaction
      ? [accountDeployTransaction, invokeTransactions]
      : [invokeTransactions]

    const result = await clientTransactionReviewService.simulateAndReview({
      transactions,
    })

    return result
  }, [calls, currentAccount])

  /** only fetch a tx simulate and review one time since e.g. a swap may expire */
  return useSWRImmutable(
    [actionHash, "useTransactionReviewV2", "simulateAndReview"],
    transactionReviewFetcher,
    {
      shouldRetryOnError: false,
    },
  )
}
