import urljoin from "url-join"

import { Network, NetworkStatus } from "../../../../shared/network"
import { fetchWithTimeout } from "../../../utils/fetchWithTimeout"
import { z } from "zod"
import { NetworkError } from "../../../../shared/errors/network"

const checklyNetworkNames = {
  "Goerli - Contract call": "goerli-alpha",
  "Goerli 2 - Contract call": "goerli-alpha-2",
  "Mainnet - Contract call": "mainnet-alpha",
  "Integration - Goerli - Get state update": "integration",
}
const checklySchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: z.object({
        hasErrors: z.boolean(),
        hasFailures: z.boolean(),
        isDegraded: z.boolean(),
      }),
    }),
  ),
})

export const getNetworkStatuses = async () => {
  try {
    const response = await fetchWithTimeout(
      urljoin(
        "https://api.checklyhq.com/v1/status-page/4054/statuses?page=1&limit=15",
      ),
      { timeout: 5000, method: "GET" },
    )
    const data = await response.json()
    const parsedData = checklySchema.safeParse(data)
    if (!parsedData.success) {
      throw new NetworkError({
        message: "NETWORK_STATUS_RESPONSE_PARSING_FAILED",
      })
    }
    const networkStatuses: Record<Network["id"], NetworkStatus> = {}
    parsedData.data.results.forEach((result) => {
      let status: NetworkStatus = "unknown"
      if (result.status.hasErrors) {
        status = "error"
      } else if (result.status.hasFailures) {
        status = "error"
      } else if (result.status.isDegraded) {
        status = "degraded"
      } else if (result.status.isDegraded === false) {
        status = "ok"
      }
      if (result.name in checklyNetworkNames) {
        const key = result.name as keyof typeof checklyNetworkNames
        networkStatuses[checklyNetworkNames[key]] = status
      }
    })

    return networkStatuses
  } catch (error) {
    console.warn({ error })
    const networkStatuses: Record<Network["id"], NetworkStatus> = {}
    Object.values(checklyNetworkNames).map((value) => {
      networkStatuses[value] = "unknown"
    })
    // Gracefully returning unknown statuses
    return networkStatuses
    throw new NetworkError({
      message: "NETWORK_STATUS_RESPONSE_PARSING_FAILED",
      options: { error },
    })
  }
}
