import { AggregatedSimData, useAspectNft } from "@argent/shared"
import { Box, Image, ImageProps, Skeleton } from "@chakra-ui/react"
import { FC } from "react"

import { IconWrapper } from "./IconWrapper"
import { UnknownDappIcon } from "./UnknownDappIcon"

interface NFTPictureProps extends ImageProps {
  nftTransfers: AggregatedSimData[]
  networkId: string
}

export const NftTransactionIcon: FC<NFTPictureProps> = ({
  nftTransfers,
  networkId,
}) => {
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
    <IconWrapper position="relative" data-testid="nft-transaction-icon">
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
