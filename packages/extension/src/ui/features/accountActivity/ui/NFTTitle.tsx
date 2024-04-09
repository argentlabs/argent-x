import { FC } from "react"
import styled from "styled-components"

import { useNft } from "../../accountNfts/nfts.state"
import { addressSchema } from "@argent/x-shared"
import { useRemoteNft } from "../../accountNfts/useRemoteNft"

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
  const nft = useNft(addressSchema.parse(contractAddress ?? ""), tokenId)
  const { data } = useRemoteNft(contractAddress, tokenId, networkId)
  const displayNft = nft ?? data
  return displayNft ? (
    <>
      <Image src={displayNft.image_url_copy} />
      {displayNft.name}
    </>
  ) : (
    <>{fallback}</>
  )
}
