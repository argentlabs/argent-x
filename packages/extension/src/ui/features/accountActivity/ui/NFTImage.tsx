import { Image, ImageProps } from "@chakra-ui/react"
import { FC } from "react"

import { useNft } from "../../accountNfts/nfts.state"
import { addressSchema } from "@argent/x-shared"
import { useRemoteNft } from "../../accountNfts/useRemoteNft"

export interface NFTImageProps extends ImageProps {
  contractAddress?: string
  tokenId?: string
  networkId: string
}

export const NFTImage: FC<NFTImageProps> = ({
  contractAddress,
  tokenId,
  networkId,
  ...rest
}) => {
  const nft = useNft(addressSchema.parse(contractAddress ?? ""), tokenId)

  // if nft is not in the storage anymore, need to fetch it because it was transfered
  const { data } = useRemoteNft(contractAddress, tokenId, networkId)
  const displayNft = nft ?? data

  return displayNft ? <Image src={displayNft.image_url_copy} {...rest} /> : null
}
