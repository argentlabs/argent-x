import { useCallback } from "react"
import { Call } from "starknet"

import { isPrivacySettingsEnabled } from "../../../../shared/settings"
import {
  ARGENT_TRANSACTION_REVIEW_API_ENABLED,
  ApiTransactionReviewResponse,
  fetchTransactionReview,
} from "../../../../shared/transactionReview.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { useBackgroundSettingsValue } from "../../../services/useBackgroundSettingsValue"
import { Account } from "../../accounts/Account"

export interface IUseTransactionReview {
  account?: Account
  transactions: Call | Call[]
  actionHash: string
}

export const useTransactionReviewEnabled = () => {
  const { value: privacyUseArgentServicesEnabled } = useBackgroundSettingsValue(
    "privacyUseArgentServices",
  )
  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_TRANSACTION_REVIEW_API_ENABLED
  }
  return (
    ARGENT_TRANSACTION_REVIEW_API_ENABLED && privacyUseArgentServicesEnabled
  )
}

export const useTransactionReview = ({
  account,
  transactions,
  actionHash,
}: IUseTransactionReview) => {
  const transactionReviewEnabled = useTransactionReviewEnabled()
  const transactionReviewFetcher = useCallback(async () => {
    if (!account) {
      return
    }
    const network = account.networkId === "goerli-alpha" ? "goerli" : "mainnet"
    const accountAddress = account.address
    return fetchTransactionReview({
      network,
      accountAddress,
      transactions,
    })
  }, [account, transactions])
  return useConditionallyEnabledSWR<ApiTransactionReviewResponse>(
    transactionReviewEnabled,
    [actionHash, "transactionReview"],
    transactionReviewFetcher,
  )
}
