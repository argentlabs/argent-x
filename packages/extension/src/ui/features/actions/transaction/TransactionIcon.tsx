import { icons } from "@argent/ui"
import {
  Box,
  BoxProps,
  Center,
  Image,
  ImageProps,
  Skeleton,
  SystemStyleObject,
} from "@chakra-ui/react"
import { FC, useMemo } from "react"

import { Network } from "../../../../shared/network"
import {
  ApiTransactionReviewTargettedDapp,
  TransactionReviewWithType,
  apiTransactionReviewActivityType,
  getTransactionReviewWithType,
} from "../../../../shared/transactionReview.service"
import { ApiTransactionReviewResponse } from "../../../../shared/transactionReview.service"
import { useAspectNft } from "../../accountNfts/aspect.service"
import { useToken } from "../../accountTokens/tokens.state"
import { useCurrentNetwork } from "../../networks/useNetworks"
import { UnknownTokenIcon } from "./UnknownTokenIcon"
import { useERC721Transfers } from "./useErc721Transfers"
import { AggregatedSimData } from "./useTransactionSimulatedData"

const { NetworkIcon, SendIcon, DocumentIcon } = icons

export interface TransactionIconProps {
  transactionReview?: ApiTransactionReviewResponse
  aggregatedData?: AggregatedSimData[]
  verifiedDapp?: ApiTransactionReviewTargettedDapp
  isDeclareContract: boolean
}

export const TransactionIcon: FC<TransactionIconProps> = ({
  transactionReview,
  aggregatedData,
  verifiedDapp,
  isDeclareContract,
}) => {
  const network = useCurrentNetwork()

  const transactionReviewWithType = useMemo(
    () => getTransactionReviewWithType(transactionReview),
    [transactionReview],
  )
  const nftTransfers = useERC721Transfers(aggregatedData)

  if (isDeclareContract) {
    return <DeclareContractIcon />
  }
  if (
    transactionReviewWithType?.type === apiTransactionReviewActivityType.swap
  ) {
    return (
      <SwapTransactionIcon
        network={network}
        transaction={transactionReviewWithType}
      />
    )
  }

  if (
    transactionReviewWithType?.type ===
    apiTransactionReviewActivityType.transfer
  ) {
    return (
      <SendTransactionIcon
        network={network}
        transaction={transactionReviewWithType}
      />
    )
  }

  if (verifiedDapp) {
    return (
      <IconWrapper>
        <Image src={verifiedDapp.iconUrl} borderRadius="2xl" />
      </IconWrapper>
    )
  }
  if (nftTransfers?.length) {
    return <NftTransactionIcon network={network} nftTransfers={nftTransfers} />
  }

  return <UnknownDappIcon />
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
}) => {
  const token1Styling: SystemStyleObject = {
    height: "9",
    width: "9",
    position: "absolute",
    zIndex: "1",
    top: "0",
    left: "0",
  }

  const token2Styling: SystemStyleObject = {
    height: "10",
    width: "10",
    position: "absolute",
    zIndex: "2",
    bottom: "0",
    right: "0",
  }

  return (
    <Center>
      <Box height="14" width="14" position="relative">
        {srcTokenImg ? (
          <Image src={srcTokenImg} sx={token1Styling} />
        ) : (
          <UnknownTokenIcon sx={token1Styling} />
        )}
        {dstTokenImg ? (
          <Image src={dstTokenImg} sx={token2Styling} />
        ) : (
          <UnknownTokenIcon sx={token2Styling} />
        )}
      </Box>
    </Center>
  )
}

interface NFTPictureProps extends ImageProps {
  nftTransfers: AggregatedSimData[]
  network: Network
}

const NftTransactionIcon: FC<NFTPictureProps> = ({ nftTransfers, network }) => {
  const { data: nft, isValidating } = useAspectNft(
    nftTransfers[0].token.address,
    nftTransfers[0].token.tokenId,
    network.id,
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

const SwapTransactionIcon = ({
  transaction,
  network,
}: {
  transaction: TransactionReviewWithType
  network: Network
}) => {
  const srcToken = useToken({
    address: transaction?.activity?.src?.token.address || "0x0",
    networkId: network.id,
  })

  const dstToken = useToken({
    address: transaction?.activity?.dst?.token.address || "0x0",
    networkId: network.id,
  })
  return (
    <Center>
      <Box height="14" width="14" position="relative">
        <Image
          src={srcToken?.image}
          height="9"
          width="9"
          position="absolute"
          zIndex="1"
          top="0"
          left="0"
        />
        <Image
          src={dstToken?.image}
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
}

const SendTransactionIcon = ({
  transaction,
  network,
}: {
  transaction: TransactionReviewWithType
  network: Network
}) => {
  const srcToken = useToken({
    address: transaction?.activity?.value?.token.address || "0x0",
    networkId: network.id,
  })
  return (
    <Center>
      <Box height="14" width="14" position="relative">
        <Center
          w="14"
          h="14"
          background="neutrals.600"
          borderRadius="90"
          boxShadow="menu"
          padding="4"
        >
          <SendIcon fontSize={"4xl"} color="white" />
          {/* // what's the fallback token image ?  */}
          {srcToken && (
            <Center
              w="28px"
              h="28px"
              background="neutrals.900"
              borderRadius="90"
              boxShadow="menu"
              padding="1"
              position="absolute"
              zIndex="1"
              right="-1"
              bottom="-1"
            >
              <Image src={srcToken?.image} height="5" width="5" zIndex="2" />
            </Center>
          )}
        </Center>
      </Box>
    </Center>
  )
}

const DeclareContractIcon = () => {
  return (
    <IconWrapper position="relative" borderRadius="90">
      <DocumentIcon />
    </IconWrapper>
  )
}
