import { P3, P4, icons } from "@argent/ui"
import { Flex, Image } from "@chakra-ui/react"
import { FC } from "react"

import { getNftPicture, useAspectNft } from "../../accountNfts/aspect.service"

const { AlertIcon } = icons

interface NftDetailsProps {
  contractAddress: string
  tokenId: string
  networkId: string
  safe?: boolean
}

export const NftDetails: FC<NftDetailsProps> = ({
  contractAddress,
  tokenId,
  networkId,
  safe,
}) => {
  const { data: nft } = useAspectNft(contractAddress, tokenId, networkId)

  if (!nft) {
    return <></>
  }

  return (
    <Flex alignItems="center" gap="2">
      <Image src={getNftPicture(nft)} w="5" h="5" borderRadius="base" />
      <P4 fontWeight="bold">{nft.name}</P4>
      {!safe && (
        <P3 color="error.500" fontWeight="bold" mt="0.25">
          <AlertIcon />
        </P3>
      )}
    </Flex>
  )
}
