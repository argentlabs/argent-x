import { useCallback, useMemo, useRef } from "react"
import useSWRImmutable from "swr/immutable"

import { clientTransactionReviewService } from "../../../services/transactionReview"
import type { TypedData } from "starknet"
import { TransactionType } from "starknet"
import { isEmpty } from "lodash-es"
import { clientAccountService } from "../../../services/account"
import type { Address, TransactionAction } from "@argent/x-shared"
import { accountService } from "../../../../shared/account/service"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { outsideSignatureSchema } from "../../../../shared/signatureReview/schema"
import { signatureReviewService } from "../../../services/signatureReview"
import { clientTokenService } from "../../../services/tokens"
import type { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"

export interface IUseTransactionReviewV2 {
  feeTokenAddress?: Address
  transaction: TransactionAction
  actionHash: string
  selectedAccount: BaseWalletAccount | undefined
  appDomain?: string
  maxSendEstimate?: boolean
}

export const getReviewForTransactions = async ({
  feeTokenAddress,
  transaction,
  selectedAccount,
  appDomain,
  maxSendEstimate,
}: Omit<IUseTransactionReviewV2, "actionHash">) => {
  const accountList = await accountService.get((account) =>
    accountsEqual(account, selectedAccount),
  )

  if (isEmpty(accountList) || !feeTokenAddress) {
    return
  }

  const currentAccount = accountList[0]

  const accountDeployTransaction = currentAccount?.needsDeploy
    ? await clientAccountService.getAccountDeployTransaction(currentAccount)
    : undefined

  const result = await clientTransactionReviewService.simulateAndReview({
    transaction,
    accountDeployTransaction,
    feeTokenAddress,
    appDomain,
    maxSendEstimate,
  })
  return { result, currentAccount }
}

export const useTransactionReviewV2 = ({
  feeTokenAddress,
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
    const response = await getReviewForTransactions({
      feeTokenAddress,
      transaction,
      selectedAccount,
      appDomain,
    })

    if (
      !response ||
      !response.result ||
      !response.currentAccount ||
      !feeTokenAddress
    ) {
      return undefined
    }
    const isSendingMoreThanBalanceAndGas = await checkGasFeeBalance(
      response.result,
      feeTokenAddress,
      response.currentAccount,
    )
    return { ...response.result, isSendingMoreThanBalanceAndGas }
  }, [appDomain, transaction, feeTokenAddress, selectedAccount])

  /** only fetch a tx simulate and review one time since e.g. a swap may expire */
  return useSWRImmutable(
    feeTokenAddress
      ? [
          actionHash,
          "useTransactionReviewV2",
          "simulateAndReview",
          feeTokenAddress,
          useCacheBust ? cacheBust.current : undefined,
        ]
      : null,
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
export const checkGasFeeBalance = async (
  result: EnrichedSimulateAndReview,
  feeTokenAddress: Address,
  currentAccount: BaseWalletAccount,
) => {
  let isSendingMoreThanBalanceAndGas = false
  const sendTransaction = result.transactions?.find((t) =>
    t?.simulation?.summary?.find((s) => s.sent),
  )
  if (!sendTransaction || !sendTransaction.simulation?.summary) {
    return isSendingMoreThanBalanceAndGas
  }

  const tokensSentAddresses = sendTransaction.simulation.summary
    .filter((s) => s.sent)
    .map((s) => s.token.address)

  const shouldCheckIfAccountHasEnoughBalance =
    result.enrichedFeeEstimation?.transactions.feeTokenAddress &&
    tokensSentAddresses.includes(
      result.enrichedFeeEstimation?.transactions.feeTokenAddress,
    )
  if (
    !shouldCheckIfAccountHasEnoughBalance ||
    !result.enrichedFeeEstimation?.transactions?.max
  ) {
    return isSendingMoreThanBalanceAndGas
  }

  const feeAmount =
    "amount" in result.enrichedFeeEstimation.transactions.max
      ? result.enrichedFeeEstimation.transactions.max.amount
      : "maxFee" in result.enrichedFeeEstimation.transactions.max
        ? result.enrichedFeeEstimation.transactions.max.maxFee
        : undefined

  const sentAmount = sendTransaction.simulation.summary.find(
    (s) => s.sent && s.token.address === feeTokenAddress,
  )?.value

  if (!feeAmount || !sentAmount) {
    return isSendingMoreThanBalanceAndGas
  }

  // optimistically use balance from storage
  const feeTokenBalance = await clientTokenService.getTokenBalance(
    feeTokenAddress,
    currentAccount.address as Address,
    currentAccount.networkId,
  )

  // fetching on-chain typically adds 500ms+ overhead
  // const feeTokenBalance = await clientTokenService.fetchTokenBalance(
  //   feeTokenAddress,
  //   currentAccount.address as Address,
  //   currentAccount.networkId,
  // )

  if (!feeTokenBalance) {
    return isSendingMoreThanBalanceAndGas
  }

  const hasEnoughToPayGas =
    BigInt(feeTokenBalance) > feeAmount + BigInt(sentAmount)
  if (!hasEnoughToPayGas) {
    isSendingMoreThanBalanceAndGas = true
  }
  return isSendingMoreThanBalanceAndGas
}
