import { Network, NetworkStatus } from "../../../../shared/network"
import { GetNetworkStatusesFn } from "./interface"
import { getProvider } from "../../../../shared/network/provider"

async function getNetworkStatus(network: Network): Promise<NetworkStatus> {
  const provider = getProvider(network)
  const sync = await provider.getSyncingStats() // throws if not connected

  // Can only be false but inproperly typed in the current version of snjs
  if (typeof sync === "boolean") {
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
