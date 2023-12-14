import {
  Address,
  ArgentBackendNftService,
  Collection,
  NftItem,
  PaginatedItems,
  isEqualAddress,
} from "@argent/shared"
import { differenceWith, groupBy, isEqual } from "lodash-es"
import { AllowArray, constants, num, shortString } from "starknet"
import { INFTService } from "./interface"
import {
  ContractAddress,
  INftsCollectionsRepository,
  INftsContractsRepository,
  INftsRepository,
} from "../storage/__new/repositories/nft"
import { Network } from "../network"
import { NetworkService } from "../network/service/implementation"

const chainIdToPandoraNetwork = (chainId: string): "mainnet" | "goerli" => {
  const encodedChainId = num.isHex(chainId)
    ? chainId
    : shortString.encodeShortString(chainId)

  switch (encodedChainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet"
    case constants.StarknetChainId.SN_GOERLI:
      return "goerli"
  }
  throw new Error(`Unsupported network ${chainId}`)
}

export class NFTService implements INFTService {
  constructor(
    private readonly networkService: NetworkService,
    private readonly nftsRepository: INftsRepository,
    private readonly nftsCollectionsRepository: INftsCollectionsRepository,
    private readonly nftsContractsRepository: INftsContractsRepository,
    private readonly argentNftService: ArgentBackendNftService,
  ) {}

  isSupported(network: Network) {
    try {
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

    return this.argentNftService.getNft(
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
    network: "mainnet" | "goerli",
    accountAddress: string,
    page = 1,
  ): Promise<PaginatedItems> {
    const paginateditems: PaginatedItems = await this.argentNftService.getNfts(
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

  async getCollection(
    chain: string,
    networkId: string,
    contractAddress: Address,
  ) {
    const axNetwork = await this.networkService.getById(networkId)

    const pandoraNetwork = chainIdToPandoraNetwork(axNetwork.chainId)
    const collection = await this.argentNftService.getCollection(
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
  ) {
    const axNetwork = await this.networkService.getById(networkId)

    const pandoraNetwork = chainIdToPandoraNetwork(axNetwork.chainId)
    await this.nftsContractsRepository.upsert(contractsAddresses)
    const collections = groupBy(
      await this.nftsCollectionsRepository.get(),
      "contractAddress",
    )

    const toPush: Collection[] = []
    for (const contract of contractsAddresses) {
      if (!collections[contract.contractAddress]) {
        const { nfts, ...rest } = await this.argentNftService.getCollection(
          chain,
          pandoraNetwork,
          contract.contractAddress,
        )
        toPush.push({ ...rest, networkId })
      }
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
}
