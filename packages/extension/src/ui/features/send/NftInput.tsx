import type { Address } from "@argent/x-shared"
import { addressSchema, getNftPicture } from "@argent/x-shared"
import { ChevronDownSecondaryIcon } from "@argent/x-ui/icons"
import { H5, ImageOptimized, P3 } from "@argent/x-ui"
import { Circle, Flex } from "@chakra-ui/react"
import type { FC } from "react"

import type { CustomButtonCellProps } from "../../components/CustomButtonCell"
import { CustomButtonCell } from "../../components/CustomButtonCell"
import { useNft } from "../accountNfts/nfts.state"
import { useRemoteNft } from "../accountNfts/useRemoteNft"

interface NftInputProps extends CustomButtonCellProps {
  contractAddress?: Address
  tokenId?: string
  networkId: string
}

export const NftInput: FC<NftInputProps> = ({
  contractAddress,
  tokenId,
  networkId,
  ...rest
}) => {
  const nft = useNft(addressSchema.parse(contractAddress ?? ""), tokenId)
  const { data } = useRemoteNft(contractAddress, tokenId, networkId)
  const displayNft = nft ?? data

  if (!displayNft) {
    return null
  }

  const title = displayNft.name || "Untitled"
  const subtitle = displayNft.contract_name || "Untitled"

  return (
    <CustomButtonCell {...rest}>
      <ImageOptimized
        borderColor="transparent"
        borderRadius="lg"
        alt={displayNft.name ?? "NFT"}
        src={getNftPicture(displayNft)}
        format="png"
        w={14}
        h={14}
        fit={"cover"}
      />
      <Flex direction={"column"} gap={1} flex={1} overflow={"hidden"}>
        <H5 whiteSpace="initial">{title}</H5>
        <P3 color={"neutrals.400"}>{subtitle}</P3>
      </Flex>
      <Circle size={7} bg="surface-default">
        <ChevronDownSecondaryIcon fontSize={"2xs"} />
      </Circle>
    </CustomButtonCell>
  )
}
