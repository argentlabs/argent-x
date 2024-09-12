import { KnownDappsBackendService } from "@argent/x-shared"
import { ARGENT_API_BASE_URL } from "../api/constants"
import { KnownDappService } from "./KnownDappService"
import { knownDappsRepository } from "./storage"

export const knownDappsBackendService = new KnownDappsBackendService(
  ARGENT_API_BASE_URL,
  {
    headers: {
      "argent-version": process.env.VERSION ?? "Unknown version",
      "argent-client": "argent-x",
    },
  },
)

export const knownDappsService = new KnownDappService(
  knownDappsRepository,
  knownDappsBackendService,
)
