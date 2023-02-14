import { icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, Fragment, useMemo } from "react"

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
    <Flex alignItems="center" textAlign="center">
      {nftTransfers?.map((nftTransfer, i) =>
        i < 2 ? (
          <NftTitle
            nftTransfer={nftTransfer}
            networkId={network.id}
            key={i}
            totalTransfers={nftTransfers.length}
            index={i}
          />
        ) : (
          i === 2 && (
            <Fragment key={i}>&nbsp;& {nftTransfers.length - 2} more</Fragment>
          )
        ),
      )}
    </Flex>
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
  nftTransfer: AggregatedSimData
  networkId: string
  index: number
  totalTransfers: number
}> = ({ nftTransfer, networkId, totalTransfers, index }) => {
  const amount = nftTransfer?.amount

  const { data: nft } = useAspectNft(
    nftTransfer?.token.address,
    nftTransfer?.token.tokenId,
    networkId,
  )

  const prefix = useMemo(() => {
    if (index !== 0) {
      if (index === totalTransfers - 1) {
        return " &"
      }
      return ","
    }
    return ""
  }, [index, totalTransfers])

  if (!nft || !amount) {
    return <></>
  }

  const action = amount.eq(0) ? "" : amount.gt(0) ? "Buy " : "Sell "

  const title = `${prefix} ${action} ${nft.name}`

  return <>{title}</>
}
