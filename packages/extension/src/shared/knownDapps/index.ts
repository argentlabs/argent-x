import { ArgentKnownDappsBackendService } from "@argent/shared"
import { ARGENT_API_BASE_URL } from "../api/constants"
import { KnownDappService } from "./implementation"
import { knownDappsRepository } from "../storage/__new/repositories/knownDapp"

export const argentKnownDappsService = new ArgentKnownDappsBackendService(
  ARGENT_API_BASE_URL,
)

export const knownDappsService = new KnownDappService(
  knownDappsRepository,
  argentKnownDappsService,
)
