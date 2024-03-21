import { useCallback } from "react"
import useSWRImmutable from "swr/immutable"

import { TransactionReviewTransactions } from "../../../../shared/transactionReview/interface"
import { clientTransactionReviewService } from "../../../services/transactionReview"
import { Call } from "starknet"
import { isArray, isEmpty } from "lodash-es"
import { clientAccountService } from "../../../services/account"
import { Address } from "@argent/x-shared"
import { accountService } from "../../../../shared/account/service"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"

export interface IUseTransactionReviewV2 {
  feeTokenAddress: Address
  calls: Call | Call[]
  actionHash: string
  selectedAccount: BaseWalletAccount | undefined
}

export const useTransactionReviewV2 = ({
  feeTokenAddress,
  calls,
  actionHash,
  selectedAccount,
}: IUseTransactionReviewV2) => {
  const transactionReviewFetcher = useCallback(async () => {
    const invokeTransactions: TransactionReviewTransactions = {
      type: "INVOKE",
      calls: isArray(calls) ? calls : [calls],
    }

    const accountList = await accountService.get((account) =>
      accountsEqual(account, selectedAccount),
    )

    if (isEmpty(accountList)) {
      return
    }

    const currentAccount = accountList[0]

    const accountDeployTransaction = currentAccount?.needsDeploy
      ? await clientAccountService.getAccountDeploymentPayload(currentAccount)
      : null

    const transactions = accountDeployTransaction
      ? [accountDeployTransaction, invokeTransactions]
      : [invokeTransactions]

    const result = await clientTransactionReviewService.simulateAndReview({
      transactions,
      feeTokenAddress,
    })

    return result
  }, [calls, feeTokenAddress, selectedAccount])

  /** only fetch a tx simulate and review one time since e.g. a swap may expire */
  return useSWRImmutable(
    [
      actionHash,
      "useTransactionReviewV2",
      "simulateAndReview",
      feeTokenAddress,
    ],
    transactionReviewFetcher,
    {
      shouldRetryOnError: false,
    },
  )
}
