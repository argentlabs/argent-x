import { ArgentKnownDappsBackendService } from "@argent/shared"

import { KnownDappService } from "./implementation"
import { ARGENT_API_BASE_URL } from "../../../../shared/api/constants"
import { knownDappsRepository } from "../../../../shared/storage/__new/repositories/knownDapp"

export const argentKnownDappsService = new ArgentKnownDappsBackendService(
  ARGENT_API_BASE_URL,
)

export const knownDappsService = new KnownDappService(
  knownDappsRepository,
  argentKnownDappsService,
)
