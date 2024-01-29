import { useCallback } from "react"
import { Call } from "starknet"

import { ARGENT_TRANSACTION_REVIEW_API_ENABLED } from "../../../../shared/api/constants"
import { argentApiNetworkForNetwork } from "../../../../shared/api/headers"
import { fetchTransactionReview } from "../../../../shared/transactionReview.service"
import { WalletAccount } from "../../../../shared/wallet.model"
import { argentApiFetcher } from "../../../services/argentApiFetcher"
import { useConditionallyEnabledSWR } from "../../../services/swr.service"

export interface IUseTransactionReview {
  account?: WalletAccount
  transactions: Call | Call[]
  actionHash?: string
}

export const useTransactionReviewEnabled = () => {
  return ARGENT_TRANSACTION_REVIEW_API_ENABLED
}

export const useTransactionReview = ({
  account,
  transactions,
  actionHash = "",
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

  return useConditionallyEnabledSWR(
    Boolean(transactionReviewEnabled),
    [actionHash, "transactionReview"],
    transactionReviewFetcher,
  )
}
