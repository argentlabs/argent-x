import { FC } from "react"
import styled from "styled-components"

import { useAspectNft } from "../../accountNfts/aspect.service"

const Image = styled.img`
  display: block;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-bottom: 8px;
`

export interface INFTTitle {
  contractAddress: string
  tokenId: string
  networkId: string
  fallback?: string
}

export const NFTTitle: FC<INFTTitle> = ({
  contractAddress,
  tokenId,
  networkId,
  fallback,
}) => {
  const { data: nft } = useAspectNft(contractAddress, tokenId, networkId)
  return nft ? (
    <>
      <Image src={nft.image_url_copy} />
      {nft.name}
    </>
  ) : (
    <>{fallback}</>
  )
}
