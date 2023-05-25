import { icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, Fragment, PropsWithChildren, useMemo } from "react"

import { prettifyTokenAmount } from "../../../../../../shared/token/price"
import { getTransactionReviewWithType } from "../../../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../../../shared/transactionReview.service"
import { useAspectNft } from "../../../../accountNfts/aspect.service"
import { useCurrentNetwork } from "../../../../networks/hooks/useCurrentNetwork"
import { ApproveScreenType } from "../../types"
import { useERC721Transfers } from "../../useErc721Transfers"
import { AggregatedSimData } from "../../useTransactionSimulatedData"

const { ArrowRightIcon } = icons

export interface TransactionTitleProps {
  transactionReview?: ApiTransactionReviewResponse
  aggregatedData?: AggregatedSimData[]
  fallback?: string
  approveScreenType: ApproveScreenType
}

const Title: FC<PropsWithChildren> = ({ children }) => (
  <Flex alignItems="center" gap="1">
    {children}
  </Flex>
)

export const TransactionTitle: FC<TransactionTitleProps> = ({
  transactionReview,
  aggregatedData,
  approveScreenType,
  fallback = "transaction",
}) => {
  const nftTransfers = useERC721Transfers(aggregatedData)
  const network = useCurrentNetwork()
  const hasNftTransfer = Boolean(nftTransfers?.length)
  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )

  // Check for specific approve screen types
  switch (approveScreenType) {
    case ApproveScreenType.DECLARE:
      return <Title>Declare contract</Title>
    case ApproveScreenType.DEPLOY:
      return <Title>Deploy contract</Title>
    case ApproveScreenType.ACCOUNT_DEPLOY:
      return <Title>Activate account</Title>
    case ApproveScreenType.MULTISIG_DEPLOY:
      return <Title>Activate multisig</Title>
    case ApproveScreenType.MULTISIG_ADD_SIGNERS:
      return <Title>Add multisig owner</Title>
    case ApproveScreenType.MULTISIG_REMOVE_SIGNER:
      return <Title>Remove multisig owner</Title>
    case ApproveScreenType.MULTISIG_UPDATE_THRESHOLD:
      return <Title>Set confirmations</Title>
    case ApproveScreenType.ADD_ARGENT_SHIELD:
      return <Title>Add Argent Shield</Title>
    case ApproveScreenType.REMOVE_ARGENT_SHIELD:
      return <Title>Remove Argent Shield</Title>
  }

  // Check for specific transaction types
  if (transactionReviewWithType?.type === "swap") {
    const srcSymbol = transactionReviewWithType.activity?.src?.token.symbol
    const dstSymbol = transactionReviewWithType.activity?.dst?.token.symbol

    return (
      <Title>
        Swap {srcSymbol}
        <ArrowRightIcon width="0.7em" height="0.8em" />
        {dstSymbol}
      </Title>
    )
  }

  if (
    transactionReviewWithType?.type === "transfer" &&
    transactionReviewWithType?.activity?.value?.amount
  ) {
    const amount = transactionReviewWithType.activity.value.amount
    const decimals = transactionReviewWithType.activity.value.token.decimals
    const symbol = transactionReviewWithType.activity.value.token.symbol

    return (
      <Title>
        Send{" "}
        {prettifyTokenAmount({
          amount,
          decimals,
        })}{" "}
        {symbol}
      </Title>
    )
  }

  // Display NFT transfers if applicable
  if (hasNftTransfer) {
    return (
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
              <Fragment key={i}>
                &nbsp;& {nftTransfers.length - 2} more
              </Fragment>
            )
          ),
        )}
      </Flex>
    )
  }

  // Default to fallback text if nothing else matched
  return <Title>Confirm {fallback}</Title>
}

const NftTitle: FC<{
  nftTransfer: AggregatedSimData
  networkId: string
  index: number
  totalTransfers: number
}> = ({ nftTransfer, networkId, totalTransfers, index }) => {
  const amount = nftTransfer?.amount

  const {
    data: nft,
    isValidating,
    error,
  } = useAspectNft(
    nftTransfer?.token.address,
    nftTransfer?.token.tokenId,
    networkId,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    },
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
    if (isValidating && !error) {
      return <></>
    }

    return <>Confirm Transaction</>
  }

  const action = amount.eq(0) ? "" : amount.gt(0) ? "Buy " : "Sell "

  const title = `${prefix} ${action} ${nft.name}`

  return <>{title}</>
}
