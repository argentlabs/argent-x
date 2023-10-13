import { Address, addressSchema, addressSchemaArgentBackend } from "../chains"
import { formatAddress, generateAvatarImage } from "../utils"
import {
  Collection,
  NftItem,
  NFTService,
  CollectionSpec,
  PaginatedItems,
} from "./interface"
import { BackendResponsePage } from "../argent/interface"
import { HTTPService, IHttpService } from "../http"
import { BackendPaginationError } from "../argent/errors"
import urlJoin from "url-join"

export type BackendCollectionType =
  | "erc721"
  | "erc1155"
  | "starknetErc721"
  | "starknetErc1155"

interface ImageUrls {
  banner?: string
  preview?: string
  full?: string
  original?: string
}

interface ArgentProfile {
  address: string
  imageUrls: ImageUrls
  displayName?: string
}

interface NftProperty {
  key: string
  value: string
  displayType?: string
}

// Interfaces for each endpoint

// GET /{chain}/{network}/collection/{contractAddress}
interface CollectionResponse {
  contractAddress: string
  imageUrls: ImageUrls
  name?: string
  description?: string
  links?: Record<string, string | undefined>
}

// GET /{chain}/{network}/collection/{contractAddress}/nfts
interface NftsItem {
  tokenId: string
  contractAddress: Address
  imageUrls: ImageUrls
  name?: string
  bestListPrice: number
  owner: ArgentProfile
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface NftsResponse extends BackendResponsePage<NftsItem> {}

// GET /{chain}/{network}/profile/{accountAddress}/nfts
// It has the same structure as NftsResponse
// So no need to define a new interface, use NftsResponse instead

// GET /{chain}/{network}/nft/{contractAddress}/{tokenId}
interface NftResponse {
  tokenId: string
  contractAddress: Address
  properties: NftProperty[]
  name?: string
  description?: string
  imageUrls: ImageUrls
  owner: ArgentProfile
  spec: BackendCollectionType
}

const PAGE_SIZE = 32

interface Headers extends RequestInit {
  "argent-version": string
  "argent-client": string
  "argent-network"?: string | undefined
}

export class ArgentBackendNftService implements NFTService {
  private readonly httpService: IHttpService

  constructor(
    protected readonly apiBase: string,
    private readonly headers: Headers | undefined,
  ) {
    this.httpService = new HTTPService(this.headers, "json")
  }

  async getNfts(
    chain: string,
    network: "mainnet" | "goerli",
    _address: string,
    page = 1,
  ): Promise<PaginatedItems> {
    const beSafeAddress = this.normalizeAddress(_address)
    const baseUrl = urlJoin(this.apiBase, "pandora", chain, network)

    // get the items owned by the profile
    const pageParam = this.pageToPageIndex(page)

    const endpoint = urlJoin(baseUrl, "profile", beSafeAddress, "nfts")
    const itemsEndpoint = `${endpoint}?page=${pageParam}&size=${PAGE_SIZE}`

    // by using Promise.all, we can make both requests in parallel, which is especially useful when rendering on the server, as the waterfall approach would be much slower
    const itemsData = await this.httpService.get<NftsResponse>(itemsEndpoint)
    const items = itemsData.content.map((input: NftsItem | NftResponse) =>
      mapItem(input, _address),
    )

    return {
      totalPages: itemsData.totalPages,
      page: itemsData.number + 1,
      count: items.length,
      nfts: items,
    }
  }

  async getCollection(
    chain: string,
    network: "mainnet" | "goerli",
    _collectionAddress: string,
    page = 1,
  ): Promise<Collection> {
    const beSafeAddress = this.normalizeAddress(_collectionAddress)
    const baseUrl = urlJoin(this.apiBase, "pandora", chain, network)
    const endpoint = urlJoin(baseUrl, "collection", beSafeAddress)

    // get the items
    const pageParam = this.pageToPageIndex(page)
    const itemsEndpoint = `${baseUrl}/collection/${beSafeAddress}/nfts?page=${pageParam}&size=${PAGE_SIZE}`
    const [data, itemsData] = await Promise.all([
      this.httpService.get<CollectionResponse>(endpoint),
      this.httpService.get<NftsResponse>(itemsEndpoint),
    ])

    const collection = mapCollection(data)
    const items = itemsData.content.map((input: NftsItem | NftResponse) =>
      mapItem(input),
    )

    return {
      ...collection,
      nfts: {
        totalPages: itemsData.totalPages,
        page: itemsData.number,
        count: items.length,
        data: items,
      },
    }
  }

  async getNft(
    chain: string,
    network: "mainnet" | "goerli",
    _collectionAddress: string,
    itemId: string,
  ): Promise<NftItem> {
    const beSafeAddress = this.normalizeAddress(_collectionAddress)
    const baseUrl = urlJoin(this.apiBase, "pandora", chain, network)
    const endpoint = urlJoin(baseUrl, "nft", beSafeAddress, itemId)
    const [data, collection] = await Promise.all([
      this.httpService.get<NftResponse>(endpoint),
      this.getCollection(chain, network, beSafeAddress),
    ])
    const item = mapItem(data)

    return {
      ...item,
      collection,
    }
  }

  protected normalizeAddress(address: string): Address {
    return addressSchemaArgentBackend.parse(address)
  }

  protected pageToPageIndex(page: number): number {
    if (!Number.isInteger(page)) {
      // dont allow floats, NaN, Infinity, etc
      throw new BackendPaginationError("notANumber")
    }
    const pageIndex = page - 1
    if (pageIndex < 0) {
      throw new BackendPaginationError("tooLow")
    }
    return pageIndex
  }
}

// Mapping functions

function mapSpec(spec: BackendCollectionType): CollectionSpec {
  switch (spec) {
    case "erc721":
    case "starknetErc721":
      return "ERC721"
    case "erc1155":
    case "starknetErc1155":
      return "ERC1155"
  }
}

function mapItem(input: NftsItem | NftResponse, address?: string): NftItem {
  const name = input.name ?? input.tokenId
  return {
    token_id: input.tokenId,
    contract_address: input.contractAddress,
    name,
    spec: "spec" in input ? mapSpec(input.spec) : undefined,
    description: "",
    best_bid_order: {
      payment_amount:
        "bestListPrice" in input ? BigInt(input.bestListPrice) : undefined,
    },
    properties:
      ("properties" in input &&
        input.properties.map((p) => ({ key: p.key, value: p.value }))) ||
      [],
    image_uri:
      input.imageUrls.preview ??
      generateAvatarImage(name, {
        background: "#15192A",
        color: "#ffffff",
      }),
    image_url_copy:
      input.imageUrls.full ??
      generateAvatarImage(name, {
        background: "#15192A",
        color: "#ffffff",
      }),

    owner: {
      account_address: input.owner?.address || address,
    },
    contract_name: formatAddress(input.contractAddress),
  }
}

function mapCollection(
  input: CollectionResponse,
): Omit<Collection, "nfts" | "totalItems"> {
  const contractAddress = addressSchema.parse(input.contractAddress)

  return {
    contractAddress,
    name: input.name || formatAddress(input.contractAddress),
    description: input.description ?? "",
    imageUri:
      input.imageUrls.preview ??
      generateAvatarImage(
        input.name || input.contractAddress.replace("0x", ""),
        {
          background: "#15192A",
          color: "#ffffff",
        },
      ),
  }
}
