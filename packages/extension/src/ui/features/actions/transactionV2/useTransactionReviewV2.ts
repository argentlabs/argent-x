import { useCallback, useMemo, useRef } from "react"
import useSWRImmutable from "swr/immutable"

import { clientTransactionReviewService } from "../../../services/transactionReview"
import type { TypedData } from "starknet"
import { TransactionType } from "starknet"
import { isEmpty } from "lodash-es"
import { clientAccountService } from "../../../services/account"
import { type Address, type TransactionAction } from "@argent/x-shared"
import { accountService } from "../../../../shared/account/service"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { outsideSignatureSchema } from "../../../../shared/signatureReview/schema"
import { signatureReviewService } from "../../../services/signatureReview"

export interface IUseTransactionReviewV2 {
  transaction: TransactionAction
  actionHash: string
  selectedAccount: BaseWalletAccount | undefined
  appDomain?: string
  maxSendEstimate?: boolean
}

export const getReviewForTransactions = async ({
  transaction,
  selectedAccount,
  appDomain,
  maxSendEstimate,
}: Omit<IUseTransactionReviewV2, "actionHash">) => {
  const accountList = await accountService.get((account) =>
    accountsEqual(account, selectedAccount),
  )

  if (isEmpty(accountList)) {
    return
  }

  const currentAccount = accountList[0]

  const accountDeployTransaction = currentAccount?.needsDeploy
    ? await clientAccountService.getAccountDeployTransaction(currentAccount)
    : undefined

  const result = await clientTransactionReviewService.simulateAndReview({
    transaction,
    accountDeployTransaction,
    appDomain,
    maxSendEstimate,
  })
  return { result, currentAccount }
}

export const useTransactionReviewV2 = ({
  transaction,
  actionHash,
  selectedAccount,
  appDomain,
}: IUseTransactionReviewV2) => {
  const cacheBust = useRef(Date.now())

  const useCacheBust = useMemo(
    () => transaction.type !== TransactionType.INVOKE,
    [transaction.type],
  )

  const transactionReviewFetcher = useCallback(async () => {
    if (!selectedAccount) return undefined

    const response = await getReviewForTransactions({
      transaction,
      selectedAccount,
      appDomain,
    })

    return response?.result
  }, [appDomain, transaction, selectedAccount])

  /** only fetch a tx simulate and review one time since e.g. a swap may expire */
  return useSWRImmutable(
    [
      actionHash,
      "useTransactionReviewV2",
      "simulateAndReview",
      useCacheBust ? cacheBust.current : undefined,
    ],
    transactionReviewFetcher,
    {
      shouldRetryOnError: false,
    },
  )
}

export const useSignatureReview = ({
  dataToSign,
  feeTokenAddress,
  appDomain,
}: {
  dataToSign: TypedData
  feeTokenAddress: Address
  appDomain?: string
}) => {
  const transactionReviewFetcher = useCallback(async () => {
    const validOutsideSignature = outsideSignatureSchema.safeParse(dataToSign)
    if (!validOutsideSignature.success) {
      return undefined
    }
    const result = await signatureReviewService.simulateAndReview({
      signature: validOutsideSignature.data,
      feeTokenAddress,
      appDomain,
    })

    return result
  }, [dataToSign, feeTokenAddress, appDomain])

  return useSWRImmutable(
    [
      dataToSign,
      "useSignatureReview",
      "simulateAndReview",
      feeTokenAddress,
      appDomain,
    ],
    transactionReviewFetcher,
    {
      shouldRetryOnError: false,
    },
  )
}
