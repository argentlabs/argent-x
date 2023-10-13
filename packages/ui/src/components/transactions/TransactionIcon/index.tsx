import {
  AggregatedSimData,
  ApiTransactionReviewResponse,
  ApiTransactionReviewTargettedDapp,
  NftItem,
  getTransactionReviewWithType,
} from "@argent/shared"
import { FC, useMemo } from "react"

import { DeclareContractIcon } from "./DeclareTransactionIcon"
import { NftTransactionIcon } from "./NftTransactionIcon"
import { SendTransactionIcon } from "./SendTransactionIcon"
import { SwapTransactionIcon } from "./SwapTransactionIcon"
import { UnknownDappIcon } from "./UnknownDappIcon"
import { VerifiedDappIcon } from "./VerifiedDappIcon"

export interface TransactionIconProps {
  networkId: string
  transactionReview?: ApiTransactionReviewResponse
  nft?: NftItem
  nftTransfers: AggregatedSimData[]
  isNftLoading?: boolean
  isDeclareContract: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transactionReview,
  nft,
  nftTransfers,
  isNftLoading,
  isDeclareContract,
  verifiedDapp,
  networkId,
}) => {
  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )

  if (isDeclareContract) {
    return <DeclareContractIcon />
  }
  if (transactionReviewWithType?.type === "swap") {
    return (
      <SwapTransactionIcon
        networkId={networkId}
        transaction={transactionReviewWithType}
      />
    )
  }

  if (transactionReviewWithType?.type === "transfer") {
    return (
      <SendTransactionIcon
        networkId={networkId}
        transaction={transactionReviewWithType}
      />
    )
  }

  if (verifiedDapp) {
    return <VerifiedDappIcon iconUrl={verifiedDapp.iconUrl} />
  }

  if (nft) {
    return (
      <NftTransactionIcon
        nft={nft}
        nftTransfers={nftTransfers}
        isNftLoading={isNftLoading}
      />
    )
  }

  return <UnknownDappIcon />
}
