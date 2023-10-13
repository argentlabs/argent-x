import { FC } from "react"
import { useParams } from "react-router-dom"

import { addressSchema } from "@argent/shared"
import { CollectionNfts } from "./CollectionNfts"
import { CollectionNftsGenericError } from "./CollectionNftsGenericError"
import { useCollection, useCollectionNfts } from "./nfts.state"

export const CollectionNftsContainer: FC = () => {
  const { contractAddress } = useParams<"contractAddress">()

  const collection = useCollection(addressSchema.parse(contractAddress))
  const nfts = useCollectionNfts(
    addressSchema.parse(collection?.contractAddress),
  )

  // if no collectibles or no contract address, display generic error
  if (!collection || !contractAddress) {
    return <CollectionNftsGenericError />
  }

  return <CollectionNfts collection={collection} nfts={nfts} />
}
