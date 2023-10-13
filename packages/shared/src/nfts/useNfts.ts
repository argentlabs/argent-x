import useSWR from "swr"

import { PaginatedItems } from "@argent/shared"
import { SWRConfigCommon, getAccountIdentifier } from "../http/swr"
import { ArgentBackendNftService } from "./argent"
import { Address } from "../chains"

const fetchNfts = async (
  nftService: ArgentBackendNftService,
  chain: string,
  network: "mainnet" | "goerli",
  address: Address,
  page = 1,
) => {
  const paginateditems: PaginatedItems = await nftService.getNfts(
    chain,
    network,
    address,
    page,
  )
  if (page < paginateditems.totalPages) {
    const nextPage: PaginatedItems = await fetchNfts(
      nftService,
      chain,
      network,
      address,
      paginateditems.page + 1,
    )

    return {
      ...paginateditems,
      nfts: paginateditems.nfts.concat(nextPage.nfts),
    }
  }
  return paginateditems
}

export const useNfts = (
  nftService: ArgentBackendNftService,
  chain: string,
  network: "mainnet" | "goerli",
  address?: Address,
  config?: SWRConfigCommon,
) => {
  const { data, ...rest } = useSWR(
    address && [getAccountIdentifier(address), "nfts"],
    () => address && fetchNfts(nftService, chain, network, address),
    {
      refreshInterval: 60e3 * 5 /* 5 minute */,
      ...config,
    },
  )

  return { nfts: data?.nfts, ...rest }
}

export const useCollection = (
  nftService: ArgentBackendNftService,
  chain: string,
  network: "mainnet" | "goerli",
  collectionAddress?: Address,
  config?: SWRConfigCommon,
) => {
  console.log("collectionAddress", chain)
  const { data: collection, ...rest } = useSWR(
    collectionAddress && [`${collectionAddress}`, "nfts-collection"],
    () =>
      collectionAddress &&
      nftService.getCollection(chain, network, collectionAddress),
    {
      refreshInterval: 60e3 /* 1 minute */,
      ...config,
    },
  )

  return { collection, ...rest }
}

export const useNft = (
  nftService: ArgentBackendNftService,
  chain: string,
  network: "mainnet" | "goerli",
  collectionAddress?: Address,
  tokenId?: string,
  config?: SWRConfigCommon,
) => {
  const { data: nft, ...rest } = useSWR(
    tokenId && collectionAddress && [`${collectionAddress}:${tokenId}`, "nft"],
    () =>
      tokenId && collectionAddress
        ? nftService.getNft(chain, network, collectionAddress, tokenId)
        : undefined,
    {
      refreshInterval: 60e3 /* 1 minute */,
      ...config,
    },
  )

  return { nft, ...rest }
}
