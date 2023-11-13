import { Network, NetworkStatus } from "../../../../shared/network"
import { GetNetworkStatusesFn } from "./interface"
import {
  getProvider,
  getProviderForRpcUrl,
  shouldUseRpcProvider,
} from "../../../../shared/network/provider"

async function getNetworkStatus(network: Network): Promise<NetworkStatus> {
  const provider = getProvider(network)
  if (!shouldUseRpcProvider(network) || !network.rpcUrl) {
    // chainId can not be used, as snjs is shallowing the network error
    await provider.getBlock("latest") // throws if not connected
    return "ok"
  }

  const rpcProvider = getProviderForRpcUrl(network.rpcUrl)
  const sync = await rpcProvider.getSyncingStats() // throws if not connected

  if (sync === false) {
    // not syncing
    return "ok"
  }

  const blockDifference = sync.highest_block_num - sync.current_block_num
  if (blockDifference <= 2) {
    return "ok"
  }
  return "degraded"
}

export const getNetworkStatuses: GetNetworkStatusesFn = async (networks) => {
  const statuses = await Promise.allSettled(
    networks.map(async (network) => getNetworkStatus(network)),
  )

  return Object.fromEntries<NetworkStatus>(
    networks.map(({ id }, i) => {
      const promise = statuses[i]
      if (promise.status === "fulfilled") {
        return [id, promise.value]
      } else {
        return [id, "error"]
      }
    }),
  )
}
