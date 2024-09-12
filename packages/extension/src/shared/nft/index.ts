import { BackendNftService } from "@argent/x-shared"
import { networkService } from "../network/service"
import {
  nftsCollectionsRepository,
  nftsContractsRepository,
  nftsRepository,
} from "./store"
import { NFTService } from "./NFTService"
import { ARGENT_API_BASE_URL, ARGENT_OPTIMIZER_URL } from "../api/constants"
import { settingsStore } from "../settings/store"

export const backendNftService = new BackendNftService(
  ARGENT_API_BASE_URL,
  {
    headers: {
      "argent-version": process.env.VERSION ?? "Unknown version",
      "argent-client": "argent-x",
    },
  },
  ARGENT_OPTIMIZER_URL,
)

export const nftService = new NFTService(
  networkService,
  nftsRepository,
  nftsCollectionsRepository,
  nftsContractsRepository,
  backendNftService,
  settingsStore,
)
