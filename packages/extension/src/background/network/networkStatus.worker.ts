import urljoin from "url-join"

import { Network, NetworkStatus } from "../../shared/network"
import { KeyValueStorage } from "../../shared/storage"
import { createStaleWhileRevalidateCache } from "../swr"
import { fetchWithTimeout } from "../utils/fetchWithTimeout"

type SwrCacheKey = string

const swrStorage = new KeyValueStorage<Record<SwrCacheKey, any>>(
  {},
  "cache:swr",
)

// see: https://github.com/jperasmus/stale-while-revalidate-cache#configuration
const swr = createStaleWhileRevalidateCache({
  storage: swrStorage, // can be any object with getItem and setItem methods
  minTimeToStale: 60e3, // 1 minute
  maxTimeToLive: 30 * 60e3, // 30 minutes
})

const getChecklyNetworkStatus = async (
  network: Network,
): Promise<NetworkStatus> =>
  swr(`${network.id}-checkly-network-status`, async () => {
    if (network.id !== "goerli-alpha") {
      // checkly is only available on goerli-alpha
      return "unknown"
    }
    try {
      const response = await fetchWithTimeout(
        `https://starknet-status.vercel.app/api/simple-status`,
        { timeout: 8000, method: "GET" },
      )
      const { status }: { status: NetworkStatus } = await response.json()

      return (response.status === 200 && status) || "error"
    } catch {
      return "error"
    }
  })

function determineStatusByRequestStatusCode(statusCode: number): NetworkStatus {
  if (statusCode === 200) {
    return "ok"
  }
  if (statusCode === 429) {
    return "degraded"
  }
  return "error"
}

const getFeederGatewayNetworkStatus = async (
  network: Network,
): Promise<NetworkStatus> =>
  swr(`${network.id}-feeder-gateway-network-status`, async () => {
    // fetch https://alpha-mainnet.starknet.io/feeder_gateway/is_alive and check the response
    try {
      const response = await fetchWithTimeout(
        urljoin(network.baseUrl, "feeder_gateway/is_alive"),
        { timeout: 5000, method: "GET" },
      )

      return determineStatusByRequestStatusCode(response.status)
    } catch {
      return "error"
    }
  })

const getGatewayNetworkStatus = async (
  network: Network,
): Promise<NetworkStatus> =>
  swr(`${network.id}-gateway-network-status`, async () => {
    // fetch https://alpha-mainnet.starknet.io/gateway/is_alive and check the response
    try {
      const response = await fetchWithTimeout(
        urljoin(network.baseUrl, "gateway/is_alive"),
        { timeout: 5000, method: "GET" },
      )

      return determineStatusByRequestStatusCode(response.status)
    } catch {
      return "error"
    }
  })

export const getDevnetStatus = async (
  network: Network,
): Promise<NetworkStatus> =>
  swr(`${network.id}-devnet-network-status`, async () => {
    // fetch http://localhost:5050/is_alive and check the response
    try {
      const response = await fetchWithTimeout(
        urljoin(network.baseUrl, "is_alive"),
        { timeout: 5000, method: "GET" },
      )

      const status = determineStatusByRequestStatusCode(response.status)

      return status
    } catch {
      return "error"
    }
  })

export const getNetworkStatus = async (
  network: Network,
): Promise<NetworkStatus> => {
  // return ok if all of the above are ok
  // return degraded if any of the above are degraded
  // return error if any of the above are error
  // return unknown if all of the above are unknown

  const isDevnet = await getDevnetStatus(network)
  if (isDevnet === "ok") {
    return isDevnet
  }

  const statuses = await Promise.all([
    getChecklyNetworkStatus(network),
    getFeederGatewayNetworkStatus(network),
    getGatewayNetworkStatus(network),
  ])

  const degraded = statuses.some((s) => s === "degraded")
  const error = statuses.some((s) => s === "error")
  const unknown = statuses.every((s) => s === "unknown")

  return unknown ? "unknown" : error ? "error" : degraded ? "degraded" : "ok"
}

export const getNetworkStatuses = async (
  networks: Network[],
): Promise<Partial<Record<Network["id"], NetworkStatus>>> => {
  const statuses = await Promise.all(
    networks.map((network) => getNetworkStatus(network)),
  )

  return networks.reduce(
    (acc, network, i) => ({ ...acc, [network.id]: statuses[i] }),
    {},
  )
}
