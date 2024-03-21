import { Address, addressSchema, getNftPicture } from "@argent/x-shared"
import { H6, P4, icons } from "@argent/x-ui"
import { Circle, Flex, Image } from "@chakra-ui/react"
import { FC } from "react"

import {
  CustomButtonCell,
  CustomButtonCellProps,
} from "../../components/CustomButtonCell"
import { useNft } from "../accountNfts/nfts.state"
import { useRemoteNft } from "../accountNfts/useRemoteNft"

const { ChevronDownIcon } = icons

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
      <Image
        borderColor="transparent"
        borderRadius="lg"
        alt={displayNft.name ?? "NFT"}
        src={getNftPicture(displayNft)}
        w={14}
        h={14}
        fit={"cover"}
      />
      <Flex direction={"column"} gap={1} flex={1} overflow={"hidden"}>
        <H6 whiteSpace="initial">{title}</H6>
        <P4 color={"neutrals.400"}>{subtitle}</P4>
      </Flex>
      <Circle size={7} bg={"neutrals.900"}>
        <ChevronDownIcon fontSize={"2xs"} />
      </Circle>
    </CustomButtonCell>
  )
}
