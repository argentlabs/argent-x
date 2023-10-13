import { useMemo } from "react"

import { useAppState } from "../../app.state"
import { useCollections } from "../accountNfts/nfts.state"

export const useFilteredCollections = (query?: string) => {
  const { switcherNetworkId } = useAppState()
  const collections = useCollections(switcherNetworkId)

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
