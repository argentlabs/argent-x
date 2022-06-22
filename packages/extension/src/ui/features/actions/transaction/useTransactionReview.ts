import { useCallback } from "react"
import { Call } from "starknet"

import { fetchTransactionReview } from "../../../../shared/transactionReview.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { useBackgroundSettingsValue } from "../../../services/useBackgroundSettingsValue"
import { Account } from "../../accounts/Account"

export interface IUseTransactionReview {
  account?: Account
  transactions: Call | Call[]
  actionHash: string
}

export const useTransactionReview = ({
  account,
  transactions,
  actionHash,
}: IUseTransactionReview) => {
  const { value: privacyUseArgentServicesEnabled } = useBackgroundSettingsValue(
    "privacyUseArgentServices",
  )
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
  return useConditionallyEnabledSWR(
    privacyUseArgentServicesEnabled,
    [actionHash, "transactionReview"],
    transactionReviewFetcher,
  )
}
