import {
  Address,
  ArgentBackendNftService,
  Collection,
  NftItem,
  PaginatedItems,
  getUint256CalldataFromBN,
} from "@argent/shared"
import { differenceWith, groupBy, isEqual } from "lodash-es"
import { CallData, constants, num, shortString } from "starknet"

import {
  ContractAddress,
  INftsCollectionsRepository,
  INftsContractsRepository,
  INftsRepository,
} from "../../../shared/storage/__new/repositories/nft"
import { AllowArray } from "../../../shared/storage/types"
import { isEqualAddress } from "../addresses"
import { messageClient } from "../messaging/trpc"
import { INFTService } from "./interface"
import { networkService } from "../../../shared/network/service"

const chainIdToPandoraNetwork = (chainId: string): "mainnet" | "goerli" => {
  const encodedChainId = num.isHex(chainId)
    ? chainId
    : shortString.encodeShortString(chainId)

  switch (encodedChainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "mainnet"
    case constants.StarknetChainId.SN_GOERLI:
      return "goerli"
    default:
      throw new Error(`Unsupported network ${chainId}`)
  }
}

export class NFTService implements INFTService {
  constructor(
    private trpcMessageClient: typeof messageClient,
    private readonly nftsRepository: INftsRepository,
    private readonly nftsCollectionsRepository: INftsCollectionsRepository,
    private readonly nftsContractsRepository: INftsContractsRepository,
    private readonly argentNftService: ArgentBackendNftService,
  ) {}

  async getAsset(
    chain: string,
    networkId: string,
    collectionAddress?: string,
    tokenId?: string,
  ) {
    if (!collectionAddress || !tokenId) {
      return null
    }

    const axNetwork = await networkService.getById(networkId)

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
      const axNetwork = await networkService.getById(networkId)

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
      throw new Error((e as Error).message)
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
    const axNetwork = await networkService.getById(networkId)

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
    const axNetwork = await networkService.getById(networkId)

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

  async transferNft(
    contractAddress: string,
    accountAddress: string,
    recipient: string,
    tokenId: string,
    schema: string,
  ) {
    let compiledCalldata = CallData.toCalldata({
      from_: accountAddress,
      to: recipient,
      tokenId: getUint256CalldataFromBN(tokenId), // OZ specs need a uint256 as tokenId
    })

    const transactions = {
      contractAddress,
      entrypoint: "transferFrom",
      calldata: compiledCalldata,
    }

    if (schema !== "ERC721") {
      transactions.entrypoint = "safeTransferFrom"

      compiledCalldata = CallData.toCalldata({
        from_: accountAddress,
        to: recipient,
        tokenId: getUint256CalldataFromBN(tokenId),
        amount: getUint256CalldataFromBN(1),
        data_len: "0",
      })

      transactions.calldata = compiledCalldata
    }

    const hash = await this.trpcMessageClient.transfer.send.mutate({
      transactions,
    })

    return hash
  }
}
