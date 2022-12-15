import { useCallback } from "react"
import { Call } from "starknet"

import { ARGENT_TRANSACTION_REVIEW_API_ENABLED } from "../../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../../shared/api/fetcher"
import {
  isPrivacySettingsEnabled,
  settingsStore,
} from "../../../../shared/settings"
import { useKeyValueStorage } from "../../../../shared/storage/hooks"
import {
  ApiTransactionReviewResponse,
  fetchTransactionReview,
} from "../../../../shared/transactionReview.service"
import { argentApiFetcher } from "../../../services/argentApiFetcher"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { Account } from "../../accounts/Account"

export interface IUseTransactionReview {
  account?: Account
  transactions: Call | Call[]
  actionHash: string
}

export const useTransactionReviewEnabled = () => {
  const privacyUseArgentServicesEnabled = useKeyValueStorage(
    settingsStore,
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
    const network = argentApiNetworkForNetwork(account.networkId)
    if (!network) {
      return
    }
    const accountAddress = account.address
    return fetchTransactionReview({
      network,
      accountAddress,
      transactions,
      fetcher: argentApiFetcher,
    })
    // TODO: come back - dont rerender when fetcher reference changes
  }, [account, transactions]) // eslint-disable-line react-hooks/exhaustive-deps
  return useConditionallyEnabledSWR<ApiTransactionReviewResponse>(
    Boolean(transactionReviewEnabled),
    [actionHash, "transactionReview"],
    transactionReviewFetcher,
  )
}
