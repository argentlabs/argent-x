import type {
  AggregatedSimData,
  ApiTransactionReviewResponse,
} from "@argent/shared"
import {
  getTransactionReviewWithType,
  prettifyTokenAmount,
  useAspectNft,
  useERC721Transfers,
} from "@argent/shared"
import { Flex } from "@chakra-ui/react"
import { FC, Fragment, useMemo } from "react"

import { ArrowRightIcon } from "../icons"

export interface TransactionTitleProps {
  networkId: string
  transactionReview?: ApiTransactionReviewResponse
  aggregatedData?: AggregatedSimData[]
  fallback?: string
  isDeclareContract: boolean
}

export const TransactionTitle: FC<TransactionTitleProps> = ({
  transactionReview,
  aggregatedData,
  isDeclareContract,
  networkId,
  fallback = "transaction",
}) => {
  const nftTransfers = useERC721Transfers(aggregatedData)
  const hasNftTransfer = Boolean(nftTransfers?.length)
  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )

  if (isDeclareContract) {
    return (
      <Flex alignItems="center" gap="1">
        Declare contract
      </Flex>
    )
  }

  if (transactionReviewWithType?.type === "swap") {
    return (
      <Flex alignItems="center" gap="1">
        Swap {transactionReviewWithType.activity?.src?.token.symbol}
        <ArrowRightIcon width="0.7em" height="0.8em" />
        {transactionReviewWithType.activity?.dst?.token.symbol}
      </Flex>
    )
  }

  if (
    transactionReviewWithType?.type === "transfer" &&
    transactionReviewWithType?.activity?.value?.amount
  ) {
    return (
      <Flex alignItems="center" gap="1">
        Send{" "}
        {prettifyTokenAmount({
          amount: transactionReviewWithType?.activity?.value?.amount,
          decimals: transactionReviewWithType?.activity?.value?.token.decimals,
        })}{" "}
        {transactionReviewWithType?.activity?.value?.token.symbol}
      </Flex>
    )
  }

  if (hasNftTransfer) {
    return (
      <Flex alignItems="center" textAlign="center">
        {nftTransfers?.map((nftTransfer, i) =>
          i < 2 ? (
            <NftTitle
              nftTransfer={nftTransfer}
              networkId={networkId}
              key={i}
              totalTransfers={nftTransfers.length}
              index={i}
            />
          ) : (
            i === 2 && (
              <Fragment key={i}>
                &nbsp;& {nftTransfers.length - 2} more
              </Fragment>
            )
          ),
        )}
      </Flex>
    )
  }

  return <>Confirm {fallback}</>
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
