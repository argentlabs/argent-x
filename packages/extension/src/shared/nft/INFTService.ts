import type { Address, Collection, NftItem } from "@argent/x-shared"
import type { ContractAddress } from "./store"
import type { AllowArray } from "../storage/types"
import type { Network } from "../network"

export interface INFTService {
  isSupported: (network: Network) => boolean
  getAsset: (
    chain: string,
    networkId: string,
    collectionAddress?: string,
    tokenId?: string,
  ) => Promise<NftItem | null>
  getAssets: (
    chain: string,
    networkId: string,
    accountAddress: string,
  ) => Promise<NftItem[]>
  getCollection: (
    chain: string,
    networkId: string,
    contractAddress: Address,
  ) => Promise<Collection>
  setCollections: (
    chain: string,
    networkId: string,
    contractsAddresses: ContractAddress[],
    accountAddress: string,
  ) => Promise<void>
  upsert: (
    nfts: AllowArray<NftItem>,
    owner: Address,
    networkId: string,
  ) => Promise<void>
  getNftMarketplaceUrl(nft: NftItem, networkId: string): Promise<string>
}
