import { icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC } from "react"

import {
  ApiTransactionReview,
  getTransactionReviewSwap,
} from "../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { useAspectNft } from "../../accountNfts/aspect.service"
import { useCurrentNetwork } from "../../networks/useNetworks"
import { useERC721Transfers } from "./useErc721Transfers"
import { AggregatedSimData } from "./useTransactionSimulatedData"

const { ArrowRightIcon } = icons

export interface TransactionTitleProps {
  transactionReview?: ApiTransactionReviewResponse
  aggregatedData?: AggregatedSimData[]
  fallback?: string
}

export const TransactionTitle: FC<TransactionTitleProps> = ({
  transactionReview,
  aggregatedData,
  fallback = "transaction",
}) => {
  const network = useCurrentNetwork()
  const swapTxn = getTransactionReviewSwap(transactionReview)

  const hasSwap = Boolean(swapTxn)

  const nftTransfers = useERC721Transfers(aggregatedData)

  const hasNftTransfer = Boolean(nftTransfers?.length)

  return hasSwap ? (
    <SwapTitle swapReview={swapTxn} />
  ) : hasNftTransfer ? (
    <NftTitle nftTransfers={nftTransfers} networkId={network.id} />
  ) : (
    <>Confirm {fallback}</>
  )
}

const SwapTitle: FC<{ swapReview?: ApiTransactionReview }> = ({
  swapReview,
}) => {
  return (
    <Flex alignItems="center" gap="1">
      Swap {swapReview?.activity?.src?.token.symbol}
      <ArrowRightIcon width="0.7em" height="0.8em" />
      {swapReview?.activity?.dst?.token.symbol}
    </Flex>
  )
}

const NftTitle: FC<{
  nftTransfers?: AggregatedSimData[]
  networkId: string
}> = ({ nftTransfers, networkId }) => {
  const nftTransfer = nftTransfers?.[0]
  const amount = nftTransfer?.amount

  const { data: nft } = useAspectNft(
    nftTransfer?.token.address,
    nftTransfer?.token.tokenId,
    networkId,
  )

  if (!nft || !amount) {
    return <></>
  }

  const action = amount.eq(0) ? "" : amount.gt(0) ? "Buy " : "Sell "

  return (
    <Flex alignItems="center" gap="1">
      {action} {nft.name}
    </Flex>
  )
}
