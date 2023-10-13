import { ArgentBackendNftService } from "@argent/shared"

import { ARGENT_API_BASE_URL } from "../../../shared/api/constants"
import {
  nftsCollectionsRepository,
  nftsContractsRepository,
  nftsRepository,
} from "../../../shared/storage/__new/repositories/nft"
import { messageClient } from "../messaging/trpc"
import { NFTService } from "./implementation"

export const argentNftService = new ArgentBackendNftService(
  ARGENT_API_BASE_URL,
  {
    "argent-version": process.env.VERSION ?? "Unknown version",
    "argent-client": "argent-x",
  },
)

export const nftService = new NFTService(
  messageClient,
  nftsRepository,
  nftsCollectionsRepository,
  nftsContractsRepository,
  argentNftService,
)
