import { Address, Collection, NftItem } from "@argent/shared"

import { ContractAddress } from "../../../shared/storage/__new/repositories/nft"
import { AllowArray } from "../../../shared/storage/types"

export interface INFTService {
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
  ) => Promise<void>
  upsert: (
    nfts: AllowArray<NftItem>,
    owner: Address,
    networkId: string,
  ) => Promise<void>
  transferNft: (
    accountAddress: string,
    contractAddress: string,
    tokenId: string,
    recipient: string,
    schema: string,
  ) => Promise<string>
}
