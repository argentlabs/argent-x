import type { Atom } from "jotai"
import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import type { ContractAddress } from "../../shared/nft/store"
import {
  nftsRepository,
  nftsCollectionsRepository,
  nftsContractsRepository,
} from "../../shared/nft/store"

import { atomFromRepo } from "./implementation/atomFromRepo"
import type { Address, Collection, NftItem } from "@argent/x-shared"
import { isEqualAddress, ensureArray } from "@argent/x-shared"

const allNftsAtom = atomFromRepo(nftsRepository)

export const allNftsView = atom(async (get) => {
  const nfts = await get(allNftsAtom)
  return nfts
})

interface AccountNftsAtomFamily {
  accountAddress?: Address
  networkId: string
}

export const accountNftsAtomFamily = (view: Atom<Promise<NftItem[]>>) =>
  atomFamily(
    ({ accountAddress, networkId }: AccountNftsAtomFamily) =>
      atom(async (get) => {
        const nfts = await get(view)
        return nfts.filter(
          (nft) =>
            isEqualAddress(nft.owner?.account_address ?? "", accountAddress) &&
            nft.networkId === networkId,
        )
      }),
    (a, b) =>
      a.accountAddress === b.accountAddress && a.networkId === b.networkId,
  )

interface NftAsset {
  contractAddress: Address
  networkId: string
  tokenId?: string
}

export const nftAssetAtomFamily = (view: Atom<Promise<NftItem[]>>) =>
  atomFamily(
    ({ contractAddress, networkId, tokenId }: NftAsset) =>
      atom(async (get) => {
        const nfts = await get(view)
        return nfts.find(
          (nft) =>
            isEqualAddress(nft.contract_address, contractAddress) &&
            nft.networkId === networkId &&
            nft.token_id === tokenId,
        )
      }),
    (a, b) =>
      a.contractAddress === b.contractAddress &&
      a.tokenId === b.tokenId &&
      a.networkId === b.networkId,
  )

export const accountNftsView = accountNftsAtomFamily(allNftsView)
export const nftAssetView = nftAssetAtomFamily(allNftsView)

/* Collections */
const allNftsCollectionsAtom = atomFromRepo(nftsCollectionsRepository)

export const allCollectionsView = atom(async (get) => {
  const nfts = await get(allNftsCollectionsAtom)
  return ensureArray(nfts)
})

export const collectionAtomFamily = (view: Atom<Promise<Collection[]>>) =>
  atomFamily(
    (contractAddress: Address) =>
      atom(async (get) => {
        const collections = await get(view)
        return collections.find((collection) =>
          isEqualAddress(collection.contractAddress, contractAddress),
        )
      }),
    (a, b) => a === b,
  )

export const collectionsByNetworkAtomFamily = (
  view: Atom<Promise<Collection[]>>,
) =>
  atomFamily(
    (networkId: string) =>
      atom(async (get) => {
        const collections = await get(view)
        return collections.filter((collection) => {
          return collection.networkId === networkId
        })
      }),
    (a, b) => a === b,
  )

interface CollectionsByAccountAndNetworkParams {
  accountAddress: Address
  networkId: string
}

export const collectionsByAccountAndNetworkAtomFamily = (
  view: Atom<Promise<Collection[]>>,
) =>
  atomFamily(
    ({ accountAddress, networkId }: CollectionsByAccountAndNetworkParams) =>
      atom(async (get) => {
        const collections = await get(view)
        const nfts = await get(allNftsView)

        const collectionsByNetwork = collections.filter(
          (collection) => collection.networkId === networkId,
        )

        const accountCollections = []
        for (const collection of collectionsByNetwork) {
          if (
            nfts.some(
              (nft) =>
                isEqualAddress(
                  nft.owner.account_address ?? "",
                  accountAddress,
                ) &&
                nft.networkId === networkId &&
                nft.contract_address === collection.contractAddress,
            )
          ) {
            accountCollections.push(collection)
          }
        }

        return accountCollections
      }),
    (a, b) =>
      isEqualAddress(a.accountAddress, b.accountAddress) &&
      a.networkId === b.networkId,
  )

export const collectionNftsAtomFamily = (nftsView: Atom<Promise<NftItem[]>>) =>
  atomFamily(
    (contractAddress: Address) =>
      atom(async (get) => {
        const nfts = await get(nftsView)

        return nfts.filter((nft) =>
          isEqualAddress(nft.contract_address, contractAddress),
        )
      }),
    (a, b) => a === b,
  )

export const collectionNftsByAccountAndNetworkAtomFamily = (
  nftsView: Atom<Promise<NftItem[]>>,
) =>
  atomFamily(
    ({
      contractAddress,
      accountAddress,
      networkId,
    }: {
      contractAddress: Address
      accountAddress: Address
      networkId?: string
    }) =>
      atom(async (get) => {
        const nfts = await get(nftsView)

        return nfts.filter(
          (nft) =>
            isEqualAddress(nft.contract_address, contractAddress) &&
            isEqualAddress(nft.owner.account_address ?? "", accountAddress) &&
            nft.networkId === networkId,
        )
      }),
    (a, b) =>
      a.contractAddress === b.contractAddress &&
      a.accountAddress === b.accountAddress &&
      a.networkId === b.networkId,
  )

export const collectionView = collectionAtomFamily(allCollectionsView)
export const collectionsByNetworkView =
  collectionsByNetworkAtomFamily(allCollectionsView)
export const collectionsByAccountAndNetworkView =
  collectionsByAccountAndNetworkAtomFamily(allCollectionsView)
export const collectionNftsByAccountAndNetworkView =
  collectionNftsByAccountAndNetworkAtomFamily(allNftsView)
export const collectionNftsView = collectionNftsAtomFamily(allNftsView)

/* contracts */
const allNftsContractsAtom = atomFromRepo(nftsContractsRepository)

export const allNftsContractsView = atom(async (get) => {
  const nfts = await get(allNftsContractsAtom)
  return ensureArray(nfts)
})

export const contractAddressesAtomFamily = (
  view: Atom<Promise<ContractAddress[]>>,
) =>
  atomFamily(
    (networkId: string) =>
      atom(async (get) => {
        const addresses = await get(view)
        return addresses
          .filter((address) => address.networkId === networkId)
          .map((address) => address.contractAddress)
      }),
    (a, b) => a === b,
  )

export const contractAddressesNfts =
  contractAddressesAtomFamily(allNftsContractsView)
