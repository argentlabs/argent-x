import type { FC } from "react"
import { useParams } from "react-router-dom"

import type { Address } from "@argent/x-shared"
import { addressSchema } from "@argent/x-shared"
import { CollectionNfts } from "./CollectionNfts"
import { CollectionNftsGenericError } from "./CollectionNftsGenericError"
import {
  useCollection,
  useCollectionNftsByAccountAndNetwork,
} from "./nfts.state"
import { selectedAccountView } from "../../views/account"
import { useView } from "../../views/implementation/react"
import { useNavigateReturnToOrBack } from "../../hooks/useNavigateReturnTo"

export const CollectionNftsContainer: FC = () => {
  const onBack = useNavigateReturnToOrBack()
  const { contractAddress } = useParams<"contractAddress">()
  const collection = useCollection(addressSchema.parse(contractAddress))
  const selectedAccount = useView(selectedAccountView)
  const nfts = useCollectionNftsByAccountAndNetwork(
    addressSchema.parse(collection?.contractAddress),
    (selectedAccount?.address as Address) ?? "0x0",
    selectedAccount?.networkId,
  )

  // if no collectibles or no contract address, display generic error
  if (!collection || !contractAddress) {
    return <CollectionNftsGenericError onBack={onBack} />
  }

  return <CollectionNfts collection={collection} nfts={nfts} onBack={onBack} />
}
