import { FC } from "react"
import styled from "styled-components"

import { useAspectNft } from "../../accountNfts/aspect.service"

export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
`

export interface INFTImage {
  contractAddress: string
  tokenId: string
  networkId: string
}

export const NFTImage: FC<INFTImage> = ({
  contractAddress,
  tokenId,
  networkId,
}) => {
  const { data: nft } = useAspectNft(contractAddress, tokenId, networkId)
  return nft ? <Image src={nft.image_url_copy} /> : null
}
