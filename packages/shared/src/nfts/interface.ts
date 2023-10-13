import { Address } from "../chains"

export interface Page<T> {
  page: number // current page
  totalPages: number // total number of pages
  count: number // size of the page (# items)
  data: T[]
}

export interface Property {
  key: string
  value: string
}

export interface BaseNftItem {
  token_id: string
  contract_address: Address
}

export type CollectionSpec = "ERC721" | "ERC1155"

export interface NftItem extends BaseNftItem {
  name: string
  description: string
  properties?: Property[]

  best_bid_order?: {
    payment_address?: string
    payment_amount?: bigint
    payment_amount_per?: bigint
  }

  spec?: CollectionSpec
  image_uri?: string
  image_url_copy?: string
  animation_uri?: string
  networkId?: string

  collection?: Collection // return the current collection of the item, but without the items of that collection to avoid infinite recursion

  owner: {
    account_address?: string
  }
  contract_name: string
}

export interface Links {
  homepage: string
  twitter?: string
  telegram?: string
  medium?: string
  discord?: string
  github?: string
  youtube?: string
}

export interface Collection {
  contractAddress: Address

  name: string
  description: string
  verified?: boolean
  imageUri: string // url
  floorPrice?: bigint // TODO
  networkId?: string

  nfts?: Page<Omit<NftItem, "collection">>
}

export type PaginatedItems = {
  page: number
  totalPages: number
  count: number
  nfts: NftItem[]
}

export interface NFTService {
  // GET /account/nfts/${address}
  getNfts(
    chain: string,
    network: "mainnet" | "goerli",
    address: string,
    page?: number,
  ): Promise<PaginatedItems>
  // GET /nfts/${collectionAddress}
  getCollection(
    chain: string,
    network: "mainnet" | "goerli",
    collectionAddress: string,
    page?: number,
  ): Promise<Collection>
  // GET /nfts/${collectionAddress}/${itemId}
  getNft(
    chain: string,
    network: "mainnet" | "goerli",
    collectionAddress: string,
    itemId: string,
  ): Promise<NftItem>
}
