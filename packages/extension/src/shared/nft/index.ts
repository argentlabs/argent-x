import { BackendNftService } from "@argent/x-shared"
import { networkService } from "../network/service"
import {
  nftsCollectionsRepository,
  nftsContractsRepository,
  nftsRepository,
} from "./store"
import { NFTService } from "./NFTService"
import { ARGENT_API_BASE_URL } from "../api/constants"
import { settingsStore } from "../settings/store"
import { httpService } from "../http/singleton"

export const backendNftService = new BackendNftService(
  ARGENT_API_BASE_URL,
  httpService,
)

export const nftService = new NFTService(
  networkService,
  nftsRepository,
  nftsCollectionsRepository,
  nftsContractsRepository,
  backendNftService,
  settingsStore,
)
