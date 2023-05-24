import {
  AggregatedSimData,
  ApiTransactionReviewResponse,
  ApiTransactionReviewTargettedDapp,
  getTransactionReviewWithType,
  useERC721Transfers,
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
  aggregatedData?: AggregatedSimData[]
  isDeclareContract: boolean
  verifiedDapp?: ApiTransactionReviewTargettedDapp
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transactionReview,
  aggregatedData,
  isDeclareContract,
  verifiedDapp,
  networkId,
}) => {
  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )
  const nftTransfers = useERC721Transfers(aggregatedData)
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

  if (nftTransfers?.length) {
    return (
      <NftTransactionIcon networkId={networkId} nftTransfers={nftTransfers} />
    )
  }

  return <UnknownDappIcon />
}
