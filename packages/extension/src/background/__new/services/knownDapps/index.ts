import { ArgentKnownDappsBackendService } from "@argent/x-shared"

import { ARGENT_API_BASE_URL } from "../../../../shared/api/constants"

export const argentKnownDappsService = new ArgentKnownDappsBackendService(
  ARGENT_API_BASE_URL,
)
