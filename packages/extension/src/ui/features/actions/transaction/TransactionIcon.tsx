import { icons } from "@argent/ui"
import { Box, BoxProps, Center, Image } from "@chakra-ui/react"
import { FC, useMemo } from "react"

import { getTransactionReviewSwap } from "../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { NFTImage } from "../../accountActivity/ui/NFTImage"
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
    <IconWrapper position="relative">
      <NFTImage
        contractAddress={nftTransfers[0].token.address}
        tokenId={nftTransfers[0].token.tokenId}
        networkId={network.id}
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
  ) : (
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
