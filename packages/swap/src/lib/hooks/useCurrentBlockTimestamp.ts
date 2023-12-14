import useSWR from "swr"

import { useSwapProvider } from "../providers"
import { getRpcProvider } from "../services/provider"

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): number | undefined {
  const { rpcUrl, chainId } = useSwapProvider()

  const { data } = useSWR("block-timestamp", async () => {
    if (!rpcUrl) {
      return undefined
    }

    const { timestamp } = await getRpcProvider(
      rpcUrl,
      chainId,
    ).getBlockWithTxHashes("latest")

    return timestamp
  })

  return data
}
