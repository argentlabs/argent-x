import type { BackendNftService, PaginatedCollections } from "@argent/x-shared"
import {
  type Address,
  type ArgentBackendNetworkId,
  type Collection,
  type NftItem,
  type PaginatedItems,
  isEqualAddress,
  isArgentNetworkId,
} from "@argent/x-shared"
import { differenceWith, groupBy, isEqual } from "lodash-es"
import type { AllowArray } from "starknet"
import { constants, num, shortString } from "starknet"
import type { INFTService } from "./INFTService"
import type {
  ContractAddress,
  INftsCollectionsRepository,
  INftsContractsRepository,
  INftsRepository,
} from "./store"
import type { Network } from "../network"
import type { NetworkService } from "../network/service/NetworkService"
import type { KeyValueStorage } from "../storage"
import type { ISettingsStorage } from "../settings/types"
import {
  defaultNftMarketplaces,
  ekuboMarketplace,
  isEkuboNft,
  type NftMarketplace,
} from "./marketplaces"

const chainIdToPandoraNetwork = (chainId: string): ArgentBackendNetworkId => {
  const encodedChainId = num.isHex(chainId)
    ? chainId
    : shortString.encodeShortString(chainId)

  switch (encodedChainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet"
    case constants.StarknetChainId.SN_SEPOLIA:
      return "sepolia"
  }
  throw new Error(`Unsupported network ${chainId}`)
}

export class NFTService implements INFTService {
  constructor(
    private readonly networkService: NetworkService,
    private readonly nftsRepository: INftsRepository,
    private readonly nftsCollectionsRepository: INftsCollectionsRepository,
    private readonly nftsContractsRepository: INftsContractsRepository,
    private readonly backendNftService: BackendNftService,
    private readonly settingsStore: KeyValueStorage<ISettingsStorage>,
  ) {}

  isSupported(network: Network) {
    try {
      if (!isArgentNetworkId(network.id)) {
        return false
      }
      chainIdToPandoraNetwork(network.chainId) // throws if not supported
      return true
    } catch {
      return false
    }
  }

  async getAsset(
    chain: string,
    networkId: string,
    collectionAddress?: string,
    tokenId?: string,
  ) {
    if (!collectionAddress || !tokenId) {
      return null
    }

    const axNetwork = await this.networkService.getById(networkId)

    const pandoraNetwork = chainIdToPandoraNetwork(axNetwork.chainId)

    return this.backendNftService.getNft(
      chain,
      pandoraNetwork,
      collectionAddress,
      tokenId,
    )
  }

  async getAssets(chain: string, networkId: string, accountAddress: string) {
    try {
      const axNetwork = await this.networkService.getById(networkId)

      const pandoraNetwork = chainIdToPandoraNetwork(axNetwork.chainId)
      const { nfts } = await this.fetchNftsUrl(
        chain,
        pandoraNetwork,
        accountAddress,
      )
      return nfts.map((nft) => ({
        ...nft,
        networkId,
      }))
    } catch (e) {
      throw new Error(`An error occured ${e}`)
    }
  }

  private async fetchNftsUrl(
    chain: string,
    network: ArgentBackendNetworkId,
    accountAddress: string,
    page = 1,
  ): Promise<PaginatedItems> {
    const paginateditems: PaginatedItems = await this.backendNftService.getNfts(
      chain,
      network,
      accountAddress,
      page,
    )
    if (page < paginateditems.totalPages) {
      const nextPage: PaginatedItems = await this.fetchNftsUrl(
        chain,
        network,
        accountAddress,
        paginateditems.page + 1,
      )

      return {
        ...paginateditems,
        nfts: paginateditems.nfts.concat(nextPage.nfts),
      }
    }
    return paginateditems
  }

  private async fetchCollectionsUrl(
    chain: string,
    network: ArgentBackendNetworkId,
    accountAddress: string,
    page = 1,
  ): Promise<PaginatedCollections> {
    const paginateditems: PaginatedCollections =
      await this.backendNftService.getProfileCollections(
        chain,
        network,
        accountAddress,
        page,
      )
    if (page < paginateditems.totalPages) {
      const nextPage: PaginatedCollections = await this.fetchCollectionsUrl(
        chain,
        network,
        accountAddress,
        paginateditems.page + 1,
      )

      return {
        ...paginateditems,
        collections: paginateditems.collections.concat(nextPage.collections),
      }
    }
    return paginateditems
  }

  async getCollection(
    chain: string,
    networkId: string,
    contractAddress: Address,
  ) {
    const axNetwork = await this.networkService.getById(networkId)

    const pandoraNetwork = chainIdToPandoraNetwork(axNetwork.chainId)
    const collection = await this.backendNftService.getCollection(
      chain,
      pandoraNetwork,
      contractAddress,
    )
    return collection
  }

  async setCollections(
    chain: string,
    networkId: string,
    contractsAddresses: ContractAddress[],
    accountAddress: string,
  ) {
    const axNetwork = await this.networkService.getById(networkId)

    const pandoraNetwork = chainIdToPandoraNetwork(axNetwork.chainId)
    await this.nftsContractsRepository.upsert(contractsAddresses)
    const collectionsRepository = groupBy(
      await this.nftsCollectionsRepository.get(),
      "contractAddress",
    )

    const toPush: Collection[] = []

    const { collections } = await this.fetchCollectionsUrl(
      chain,
      pandoraNetwork,
      accountAddress,
    )

    for (const collection of collections) {
      // already stored
      if (collectionsRepository[collection.contractAddress]) {
        continue
      }

      toPush.push({ ...collection, networkId })
    }

    if (toPush.length > 0) {
      await this.nftsCollectionsRepository.upsert(toPush)
    }
  }

  async upsert(
    nfts: AllowArray<NftItem>,
    owner: Address,
    networkId: string,
  ): Promise<void> {
    // check if there is a difference for the current owner and remove from storage
    // this will be the retrieved when the new owner fetch the nfts
    const repositoryNfts = await this.nftsRepository.get(
      (nft) =>
        isEqualAddress(nft.owner?.account_address ?? "", owner) &&
        nft.networkId === networkId,
    )
    const differentNftsSameOwner = differenceWith(
      repositoryNfts ?? [],
      Array.isArray(nfts) ? nfts : [nfts],
      isEqual,
    )

    const differentOwnerNfts = await this.nftsRepository.get(
      (nft) =>
        !isEqualAddress(nft.owner?.account_address ?? "", owner) &&
        nft.networkId === networkId,
    )

    const removed = [...differentOwnerNfts, ...differentNftsSameOwner]

    if (removed.length > 0) {
      await this.nftsRepository.remove(removed)
    }

    await this.nftsRepository.upsert(nfts)
  }

  async getNftMarketplaceUrl(nft: NftItem, networkId: string) {
    let nftMarketplace: NftMarketplace
    if (isEkuboNft(nft)) {
      nftMarketplace = ekuboMarketplace
    } else {
      const nftMarketplaceKey =
        await this.settingsStore.get("nftMarketplaceKey")
      nftMarketplace = defaultNftMarketplaces[nftMarketplaceKey]
    }
    if (!nftMarketplace.url[networkId]) {
      throw new Error(
        `${nftMarketplace.title} is not available on ${networkId}`,
      )
    }
    const urlFn = nftMarketplace.url[networkId]
    const url = urlFn(nft.contract_address, nft.token_id)
    return url
  }
}
