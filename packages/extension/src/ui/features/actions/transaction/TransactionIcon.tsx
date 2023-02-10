import { icons } from "@argent/ui"
import {
  Box,
  BoxProps,
  Center,
  Image,
  ImageProps,
  Skeleton,
} from "@chakra-ui/react"
import { FC, useMemo } from "react"

import { getTransactionReviewSwap } from "../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { useAspectNft } from "../../accountNfts/aspect.service"
import { useToken } from "../../accountTokens/tokens.state"
import { useCurrentNetwork } from "../../networks/useNetworks"
import { useERC721Transfers } from "./useErc721Transfers"
import { AggregatedSimData } from "./useTransactionSimulatedData"

const { NetworkIcon } = icons

export interface TransactionIconProps {
  transactionReview?: ApiTransactionReviewResponse
  aggregatedData?: AggregatedSimData[]
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transactionReview,
  aggregatedData,
}) => {
  const network = useCurrentNetwork()

  const swapTxn = useMemo(
    () => getTransactionReviewSwap(transactionReview),
    [transactionReview],
  )

  const hasSwap = Boolean(swapTxn)

  const srcToken = useToken({
    address: swapTxn?.activity?.src?.token.address || "0x0",
    networkId: network.id,
  })

  const dstToken = useToken({
    address: swapTxn?.activity?.dst?.token.address || "0x0",
    networkId: network.id,
  })

  const nftTransfers = useERC721Transfers(aggregatedData)

  const hasNftTransfer = Boolean(nftTransfers?.length)

  return hasSwap ? (
    <SwapTokensImage
      srcTokenImg={srcToken?.image}
      dstTokenImg={dstToken?.image}
    />
  ) : hasNftTransfer ? (
    <NftPictures nftTransfers={nftTransfers} networkId={network.id} />
  ) : (
    <UnknownDappIcon />
  )
}

const UnknownDappIcon = () => {
  return (
    <IconWrapper>
      <NetworkIcon fontSize={"4xl"} color="neutrals.500" />
    </IconWrapper>
  )
}

const SwapTokensImage: FC<{ srcTokenImg?: string; dstTokenImg?: string }> = ({
  srcTokenImg,
  dstTokenImg,
}) => (
  <Center>
    <Box height="14" width="14" position="relative">
      <Image
        src={srcTokenImg}
        height="9"
        width="9"
        position="absolute"
        zIndex="1"
        top="0"
        left="0"
      />
      <Image
        src={dstTokenImg}
        height="10"
        width="10"
        position="absolute"
        zIndex="2"
        bottom="0"
        right="0"
      />
    </Box>
  </Center>
)

interface NFTPictureProps extends ImageProps {
  nftTransfers: AggregatedSimData[]
  networkId: string
}

const NftPictures: FC<NFTPictureProps> = ({ nftTransfers, networkId }) => {
  const { data: nft, isValidating } = useAspectNft(
    nftTransfers[0].token.address,
    nftTransfers[0].token.tokenId,
    networkId,
  )

  if (isValidating) {
    return (
      <IconWrapper>
        <Skeleton
          borderRadius="2xl"
          startColor="neutrals.500"
          endColor="neutrals.700"
        />
      </IconWrapper>
    )
  }

  if (!nft) {
    return <UnknownDappIcon />
  }

  return (
    <IconWrapper position="relative">
      <Image
        src={nft.image_url_copy}
        borderRadius="2xl"
        position={nftTransfers.length > 1 ? "absolute" : "relative"}
        left={nftTransfers.length > 1 ? "-14.29%" : "auto"}
        right={nftTransfers.length > 1 ? "14.29%" : "auto"}
        filter="auto"
        dropShadow="menu"
        zIndex={3}
      />
      {nftTransfers.length > 1 && (
        <>
          <Box
            h="14"
            w="14"
            borderRadius="2xl"
            boxShadow="menu"
            position="absolute"
            bgColor="neutrals.600"
            zIndex={2}
          />
          <Box
            h="14"
            w="14"
            borderRadius="2xl"
            boxShadow="menu"
            bgColor="neutrals.700"
            position="absolute"
            left="14.29%"
            right="-14.29%"
            zIndex={1}
          />
        </>
      )}
    </IconWrapper>
  )
}

const IconWrapper: FC<BoxProps> = ({
  children,
  ...rest
}: {
  children?: React.ReactNode
}) => {
  return (
    <Center
      w="14"
      h="14"
      background="neutrals.700"
      borderRadius="2xl"
      boxShadow="menu"
      {...rest}
    >
      {children}
    </Center>
  )
}
