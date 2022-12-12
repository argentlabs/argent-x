import { Image } from "@chakra-ui/react"
import { ComponentProps, FC } from "react"

import { useAspectNft } from "../../accountNfts/aspect.service"

export interface NFTImageProps extends ComponentProps<typeof Image> {
  contractAddress: string
  tokenId: string
  networkId: string
}

export const NFTImage: FC<NFTImageProps> = ({
  contractAddress,
  tokenId,
  networkId,
  ...rest
}) => {
  const { data: nft } = useAspectNft(contractAddress, tokenId, networkId)
  return nft ? <Image src={nft.image_url_copy} {...rest} /> : null
}
