import {
  Fetcher,
  argentApiHeadersForNetwork,
  fetcher,
} from "../../shared/api/fetcher"
import { useAppState } from "../app.state"

/**
 * Returns an SWR-compliant fetcher which will apply the expected API headers to each request,
 * including the currently selected network
 *
 * @see argentApiHeadersForNetwork
 */

export const argentApiFetcher = <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fetcherImpl: Fetcher = fetcher,
) => {
  const { switcherNetworkId } = useAppState.getState()
  const initWithArgentApiHeaders = {
    ...init,
    headers: {
      ...init?.headers,
      ...argentApiHeadersForNetwork(switcherNetworkId),
    },
  }
  return fetcherImpl<T>(input, initWithArgentApiHeaders)
}
