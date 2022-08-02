import { useCallback } from "react"
import { Call } from "starknet"

import { settingsStorage } from "./../../../../shared/settings/storage"
import { ARGENT_TRANSACTION_REVIEW_API_ENABLED } from "../../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../../shared/api/fetcher"
import { PublicNetworkIds } from "../../../../shared/network/public"
import {
  ISettingsStorage,
  isPrivacySettingsEnabled,
} from "../../../../shared/settings"
import { useObjectStorage } from "../../../../shared/storage/hooks"
import {
  ApiTransactionReviewResponse,
  fetchTransactionReview,
} from "../../../../shared/transactionReview.service"
import { useConditionallyEnabledSWR } from "../../../services/swr"
import { useArgentApiFetcher } from "../../../services/useArgentApiFetcher"
import { Account } from "../../accounts/Account"

export interface IUseTransactionReview {
  account?: Account
  transactions: Call | Call[]
  actionHash: string
}

export const useTransactionReviewEnabled = () => {
  const { privacyUseArgentServices } =
    useObjectStorage<ISettingsStorage>(settingsStorage)
  /** ignore `privacyUseArgentServices` entirely when the Privacy Settings UI is disabled */
  if (!isPrivacySettingsEnabled) {
    return ARGENT_TRANSACTION_REVIEW_API_ENABLED
  }
  return ARGENT_TRANSACTION_REVIEW_API_ENABLED && privacyUseArgentServices
}

export const useTransactionReview = ({
  account,
  transactions,
  actionHash,
}: IUseTransactionReview) => {
  const fetcher = useArgentApiFetcher()
  const transactionReviewEnabled = useTransactionReviewEnabled()
  const transactionReviewFetcher = useCallback(async () => {
    if (!account) {
      return
    }
    const network = argentApiNetworkForNetwork(
      account.networkId as PublicNetworkIds,
    )
    const accountAddress = account.address
    return fetchTransactionReview({
      network,
      accountAddress,
      transactions,
      fetcher,
    })
    // TODO: come back - dont rerender when fetcher reference changes
  }, [account, transactions]) // eslint-disable-line react-hooks/exhaustive-deps
  return useConditionallyEnabledSWR<ApiTransactionReviewResponse>(
    !!transactionReviewEnabled,
    [actionHash, "transactionReview"],
    transactionReviewFetcher,
  )
}
