import { useERC20Transactions, useERC721Transactions } from "@argent/shared"
import { icons } from "@argent/ui"
import { Flex } from "@chakra-ui/react"
import { FC, Fragment, PropsWithChildren, useMemo } from "react"

import { prettifyTokenAmount } from "../../../../../../shared/token/price"
import { getTransactionReviewWithType } from "../../../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../../../shared/transactionReview.service"
import { useRemoteNft } from "../../../../accountNfts/useRemoteNft"
import { useCurrentNetwork } from "../../../../networks/hooks/useCurrentNetwork"
import { ApproveScreenType } from "../../types"
import { AggregatedSimData } from "../../useTransactionSimulatedData"

const { ArrowRightIcon } = icons

export interface TransactionTitleArgentXProps {
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

export const TransactionTitleArgentX: FC<TransactionTitleArgentXProps> = ({
  transactionReview,
  aggregatedData,
  approveScreenType,
  fallback = "transaction",
}) => {
  const network = useCurrentNetwork()
  const nftTransfers = useERC721Transactions(aggregatedData)
  const hasNftTransfer = Boolean(nftTransfers?.length)

  const erc20Transfers = useERC20Transactions(aggregatedData)
  const hasErc20Transfers = Boolean(erc20Transfers.length)

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
    case ApproveScreenType.MULTISIG_REMOVE_SIGNERS:
      return <Title>Remove multisig owner</Title>
    case ApproveScreenType.MULTISIG_REPLACE_SIGNER:
      return <Title>Replace multisig owner</Title>
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
              hasErc20Transfer={hasErc20Transfers}
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
  hasErc20Transfer: boolean
  networkId: string
  index: number
  totalTransfers: number
}> = ({ nftTransfer, hasErc20Transfer, networkId, totalTransfers, index }) => {
  const amount = nftTransfer?.amount

  const {
    data: nft,
    isValidating,
    error,
  } = useRemoteNft(
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
    if (isValidating && !error) {
      return <></>
    }

    return <>Confirm Transaction</>
  }

  let action = ""

  if (hasErc20Transfer) {
    action = amount === 0n ? "" : amount === 0n ? "Buy " : "Sell "
  } else {
    action = "Transfer "
  }

  const title = `${prefix} ${action} ${nft.name}`

  return <>{title}</>
}
