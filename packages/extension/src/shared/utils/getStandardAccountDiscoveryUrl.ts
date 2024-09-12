import urlJoin from "url-join"
import { ARGENT_ACCOUNT_DISCOVERY_URL } from "../api/constants"
import { RecoveryError } from "../errors/recovery"
import { argentApiNetworkForNetwork } from "../api/headers"

export function getStandardAccountDiscoveryUrl(networkId: string) {
  const backendNetwork = argentApiNetworkForNetwork(networkId)

  if (
    process.env.NODE_ENV !== "production" && // be more strict in development
    !ARGENT_ACCOUNT_DISCOVERY_URL
  ) {
    throw new RecoveryError({
      code: "ARGENT_ACCOUNT_DISCOVERY_URL_NOT_SET",
    })
  }

  if (!backendNetwork || !ARGENT_ACCOUNT_DISCOVERY_URL) {
    // and more lax in production
    return
  }

  return urlJoin(ARGENT_ACCOUNT_DISCOVERY_URL, backendNetwork)
}
