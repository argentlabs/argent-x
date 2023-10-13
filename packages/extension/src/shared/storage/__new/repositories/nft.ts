import { Collection, NftItem, isEqualAddress } from "@argent/shared"
import browser from "webextension-polyfill"

import { ChromeRepository } from "../chrome"
import type { IRepository } from "../interface"

export type ContractAddress = {
  contractAddress: string
  networkId: string
}

export type INftsRepository = IRepository<NftItem>
export type INftsCollectionsRepository = IRepository<Collection>
export type INftsContractsRepository = IRepository<ContractAddress>

export const nftsRepository: INftsRepository = new ChromeRepository<NftItem>(
  browser,
  {
    areaName: "local",
    namespace: "nfts_v2",
    compare(a: NftItem, b: NftItem) {
      return (
        a.token_id === b.token_id &&
        isEqualAddress(a.contract_address, b.contract_address)
      )
    },
  },
)

export const nftsCollectionsRepository: INftsCollectionsRepository =
  new ChromeRepository<Collection>(browser, {
    areaName: "local",
    namespace: "nftsCollections_v2",
    compare(a: Collection, b: Collection) {
      return isEqualAddress(a.contractAddress, b.contractAddress)
    },
  })

export const nftsContractsRepository: INftsContractsRepository =
  new ChromeRepository<ContractAddress>(browser, {
    areaName: "local",
    namespace: "nftsContracts_v2",
    compare(a: ContractAddress, b: ContractAddress) {
      return (
        isEqualAddress(a.contractAddress, b.contractAddress) &&
        a.networkId === b.networkId
      )
    },
  })
