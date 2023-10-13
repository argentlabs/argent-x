import useSWR from "swr"

import { useSwapProvider } from "../providers"
import { getProviderForNetworkId } from "../services/provider"

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): number | undefined {
  const { networkId } = useSwapProvider()

  const { data } = useSWR("block-timestamp", async () => {
    if (!networkId) {
      return undefined
    }

    const provider = getProviderForNetworkId(networkId)

    const blockResponse = await provider.getBlock("latest")

    return blockResponse.timestamp
  })

  return data
}
