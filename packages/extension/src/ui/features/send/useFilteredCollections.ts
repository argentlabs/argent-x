import { useMemo } from "react"

import { useCollections } from "../accountNfts/nfts.state"
import { selectedNetworkIdView } from "../../views/network"
import { useView } from "../../views/implementation/react"

export const useFilteredCollections = (query?: string) => {
  const selectedNetworkId = useView(selectedNetworkIdView)
  const collections = useCollections(selectedNetworkId)

  const filteredCollections = useMemo(() => {
    if (!query) {
      return collections
    }

    const queryLowercase = query.toLowerCase()

    return collections?.filter(
      (collectible) =>
        collectible.name?.toLowerCase().includes(queryLowercase) ||
        collectible.contractAddress.toLowerCase().includes(queryLowercase),
    )
  }, [collections, query])

  return { collections, filteredCollections }
}
