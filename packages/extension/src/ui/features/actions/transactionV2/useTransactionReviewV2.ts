import { useCallback } from "react"
import useSWRImmutable from "swr/immutable"

import { TransactionReviewTransactions } from "../../../../shared/transactionReview/interface"
import { clientTransactionReviewService } from "../../../services/transactionReview"
import { Call, TypedData } from "starknet"
import { isArray, isEmpty } from "lodash-es"
import { clientAccountService } from "../../../services/account"
import { Address } from "@argent/x-shared"
import { accountService } from "../../../../shared/account/service"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { accountsEqual } from "../../../../shared/utils/accountsEqual"
import { outsideSignatureSchema } from "../../../../shared/signatureReview/schema"
import { signatureReviewService } from "../../../services/signatureReview"
import { clientTokenService } from "../../../services/tokens"
import { EnrichedSimulateAndReview } from "@argent/x-shared/simulation"

export interface IUseTransactionReviewV2 {
  feeTokenAddress?: Address
  calls: Call | Call[]
  actionHash: string
  selectedAccount: BaseWalletAccount | undefined
  appDomain?: string
}

export const getReviewForTransactions = async ({
  feeTokenAddress,
  calls,
  selectedAccount,
  appDomain,
}: Omit<IUseTransactionReviewV2, "actionHash">) => {
  const invokeTransactions: TransactionReviewTransactions = {
    type: "INVOKE",
    calls: isArray(calls) ? calls : [calls],
  }

  const accountList = await accountService.get((account) =>
    accountsEqual(account, selectedAccount),
  )

  if (isEmpty(accountList) || !feeTokenAddress) {
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
    appDomain,
  })
  return { result, currentAccount }
}
export const useTransactionReviewV2 = ({
  feeTokenAddress,
  calls,
  actionHash,
  selectedAccount,
  appDomain,
}: IUseTransactionReviewV2) => {
  const transactionReviewFetcher = useCallback(async () => {
    const response = await getReviewForTransactions({
      feeTokenAddress,
      calls,
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
  }, [appDomain, calls, feeTokenAddress, selectedAccount])

  /** only fetch a tx simulate and review one time since e.g. a swap may expire */
  return useSWRImmutable(
    feeTokenAddress
      ? [
          actionHash,
          "useTransactionReviewV2",
          "simulateAndReview",
          feeTokenAddress,
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
  const sendTransaction = result.transactions.find((t) =>
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

  const feeTokenBalance = await clientTokenService.fetchTokenBalance(
    feeTokenAddress,
    currentAccount.address as Address,
    currentAccount.networkId,
  )
  const hasEnoughToPayGas =
    BigInt(feeTokenBalance) > feeAmount + BigInt(sentAmount)
  if (!hasEnoughToPayGas) {
    isSendingMoreThanBalanceAndGas = true
  }
  return isSendingMoreThanBalanceAndGas
}
