import { KnownDappsBackendService } from "@argent/x-shared"

import { ARGENT_API_BASE_URL } from "../../../shared/api/constants"

export const knownDappsBackendService = new KnownDappsBackendService(
  ARGENT_API_BASE_URL,
)
