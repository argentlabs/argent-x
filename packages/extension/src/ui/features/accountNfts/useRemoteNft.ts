import type { Collection, NftItem } from "@argent/x-shared"
import { addressSchema } from "@argent/x-shared"
import type { SWRConfiguration } from "swr"
import useSWR from "swr"

import { useCollection, useNft } from "./nfts.state"
import { nftService } from "../../../shared/nft"

export const useRemoteNft = (
  contractAddress: string | undefined,
  tokenId: string | undefined,
  networkId: string,
  chain = "starknet",
  swrConfig?: SWRConfiguration,
) => {
  return useSWR<NftItem | null>(
    contractAddress && tokenId ? [`${contractAddress}:${tokenId}`] : null,
    () => nftService.getAsset(chain, networkId, contractAddress, tokenId),
    swrConfig,
  )
}

export const useIndexedNft = (
  contractAddress: string | undefined,
  tokenId: string | undefined,
  networkId: string,
  chain = "starknet",
  swrConfig?: SWRConfiguration,
) => {
  const parsedAddress = addressSchema.parse(contractAddress)
  const indexedNft = useNft(parsedAddress, tokenId)

  return useSWR<NftItem | null>(
    contractAddress && tokenId ? [`${contractAddress}:${tokenId}`] : null,
    () => {
      if (indexedNft) {
        return indexedNft
      }

      return nftService.getAsset(chain, networkId, contractAddress, tokenId)
    },
    swrConfig,
  )
}

export const useIndexedCollection = (
  contractAddress: string,
  networkId: string,
  chain = "starknet",
  swrConfig?: SWRConfiguration,
) => {
  const parsedAddress = addressSchema.parse(contractAddress)
  const indexedCollection = useCollection(parsedAddress)

  return useSWR<Collection | null>(
    contractAddress ? [contractAddress] : null,
    () => {
      if (indexedCollection) {
        return indexedCollection
      }

      return nftService.getCollection(chain, networkId, parsedAddress)
    },
    swrConfig,
  )
}
