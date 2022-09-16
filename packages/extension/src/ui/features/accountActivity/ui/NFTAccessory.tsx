import { FC } from "react"
import styled from "styled-components"

import { NFTTransaction } from "../transform/type"
import { NFTImage } from "./NFTImage"

const NFTImageContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  flex-shrink: 0;
  overflow: hidden;
`

export interface INFTAccessory {
  transaction: NFTTransaction
  networkId: string
}

export const NFTAccessory: FC<INFTAccessory> = ({ transaction, networkId }) => {
  const { contractAddress, tokenId } = transaction
  return (
    <NFTImageContainer>
      <NFTImage
        contractAddress={contractAddress}
        tokenId={tokenId}
        networkId={networkId}
      />
    </NFTImageContainer>
  )
}
