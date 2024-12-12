import { normalizeHost } from "../../../services/knownDapps"
import { influenceWhitelistedDomains } from "../../../../shared/sessionKeys/whitelist"

export const useIsInfluenceDapp = (host: string) => {
  try {
    const inputHost = new URL(host).host
    return influenceWhitelistedDomains
      .map((host) => normalizeHost(new URL(host).host))
      .includes(normalizeHost(inputHost))
  } catch {
    // failure implies invalid
  }
  return false
}
