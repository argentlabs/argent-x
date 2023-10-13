import { Address } from "@argent/shared"

import { useView } from "../../views/implementation/react"
import {
  accountNftsView,
  collectionNftsView,
  collectionView,
  collectionsByNetworkView,
  collectionsByAccountAndNetworkView,
  contractAddressesNfts,
  nftAssetView,
} from "../../views/nft"
import { useCurrentNetwork } from "../networks/hooks/useCurrentNetwork"

export const useOwnedNfts = (accountAddress: Address) => {
  const { id: networkId } = useCurrentNetwork()
  return useView(accountNftsView({ accountAddress, networkId }))
}

export const useCollections = (networkId: string) => {
  return useView(collectionsByNetworkView(networkId))
}

export const useCollectionsByAccountAndNetwork = (
  accountAddress: Address,
  networkId: string,
) => {
  return useView(
    collectionsByAccountAndNetworkView({ accountAddress, networkId }),
  )
}

export const useCollection = (contractAddress: Address) => {
  return useView(collectionView(contractAddress))
}

export const useCollectionNfts = (contractAddress: Address) => {
  return useView(collectionNftsView(contractAddress))
}

export const useNft = (contractAddress: Address, tokenId?: string) => {
  const { id: networkId } = useCurrentNetwork()
  return useView(nftAssetView({ contractAddress, networkId, tokenId }))
}

export const useContractAddresses = () => {
  const { id: networkId } = useCurrentNetwork()
  return useView(contractAddressesNfts(networkId))
}
