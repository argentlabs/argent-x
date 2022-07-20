import { useMemo } from "react"

import { fetcherWithArgentApiHeadersForNetwork } from "../../shared/api/fetcher"
import { PublicNetworkIds } from "../../shared/network/public"
import { useAppState } from "../app.state"

/**
 * Returns an SWR-compliant fetcher which will apply the expected API headers to each request,
 * including the currently selected network
 *
 * @see fetcherWithArgentApiHeadersForNetwork
 */

export const useArgentApiFetcher = () => {
  const { switcherNetworkId } = useAppState()
  const fetcher = useMemo(() => {
    return fetcherWithArgentApiHeadersForNetwork(
      switcherNetworkId as PublicNetworkIds,
    )
  }, [switcherNetworkId])
  return fetcher
}
