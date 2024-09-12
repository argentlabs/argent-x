import {
  prettifyTokenAmount,
  useERC20Transactions,
  useERC721Transactions,
} from "@argent/x-shared"
import { TextWithAmount, iconsDeprecated } from "@argent/x-ui"
import { Flex } from "@chakra-ui/react"
import { FC, Fragment, PropsWithChildren, useMemo } from "react"

import { isEmpty } from "lodash-es"
import {
  getTransactionActionByType,
  transactionReviewHasSwap,
  transactionReviewHasTransfer,
} from "../../../../../../shared/transactionReview.service"
import { Property, ReviewOfTransaction } from "@argent/x-shared/simulation"
import { useRemoteNft } from "../../../../accountNfts/useRemoteNft"
import { useCurrentNetwork } from "../../../../networks/hooks/useCurrentNetwork"
import { ApproveScreenType } from "../../types"
import { AggregatedSimData } from "../../useTransactionSimulatedData"

const { ArrowRightIcon } = iconsDeprecated

export interface TransactionTitleArgentXProps {
  transactionReview?: ReviewOfTransaction
  aggregatedData?: AggregatedSimData[]
  fallback?: string
  approveScreenType: ApproveScreenType
}

const Title: FC<PropsWithChildren> = (props) => (
  <Flex alignItems="center" gap="1" {...props} />
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

  const isSwap = transactionReviewHasSwap(transactionReview)
  const isTransfer = transactionReviewHasTransfer(transactionReview)

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
    case ApproveScreenType.ADD_GUARDIAN:
      return <Title>Add Guardian</Title>
    case ApproveScreenType.REMOVE_GUARDIAN:
      return <Title>Remove Guardian</Title>
  }

  // Check for specific transaction types
  if (isSwap) {
    const srcSymbol = aggregatedData?.find((ag) => ag.recipients.length > 0)
      ?.token.symbol
    const dstSymbol = aggregatedData?.find((ag) => isEmpty(ag.recipients))
      ?.token.symbol

    return (
      <Title>
        Swap {srcSymbol}
        <ArrowRightIcon width="0.7em" height="0.8em" />
        {dstSymbol}
      </Title>
    )
  }

  if (isTransfer) {
    const action = getTransactionActionByType(
      "ERC20_transfer",
      transactionReview,
    )
    if (action) {
      const amountProperty = [
        ...action.properties,
        ...(action.defaultProperties || []),
      ].find((p) => p.type === "amount")

      if (amountProperty) {
        const property = amountProperty as Extract<Property, { type: "amount" }>
        const amount = property.amount
        const decimals = property.token.decimals
        const symbol = property.token.symbol

        if (amount && decimals) {
          return (
            <TextWithAmount amount={amount} decimals={decimals}>
              <Title data-testid="send-title">
                Send{" "}
                {prettifyTokenAmount({
                  amount,
                  decimals,
                })}{" "}
                {symbol}
              </Title>
            </TextWithAmount>
          )
        }
      }
    }
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
