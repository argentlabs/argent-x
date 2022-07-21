/** generic json fetcher */

import type { NetworkLog } from "./../../shared/networkLog"
import { useNetworkLogsStore } from "./../../ui/features/settings/networkLogs.state"
import { PublicNetworkIds } from "../network/public"

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<any>

export interface FetcherError extends Error {
  url?: string
  status?: number
  statusText?: string
  responseText?: string
}

export const fetcherError = (
  message: string,
  response: Response,
  responseText: string,
) => {
  const error: FetcherError = new Error(message)
  error.url = response.url
  error.status = response.status
  error.statusText = response.statusText
  error.responseText = responseText
  return error
}

export const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
  let log: NetworkLog = {
    url: "",
  }
  if (typeof input === "string") {
    log = {
      ...log,
      url: input,
    }
  }
  if ((input as Request)?.url) {
    log.url = (input as Request).url
  }

  if (init?.headers) {
    log.headers = init.headers
  }
  if (init?.method) {
    log.method = init.method
  }
  if (init?.body) {
    log.body = init.body as string
  }

  const networkLogs = useNetworkLogsStore.getState().networkLogs
  networkLogs.push(log)
  useNetworkLogsStore.setState({ networkLogs })
  localStorage.setItem("networkLogs", JSON.stringify(networkLogs))

  const response = await fetch(input, init)
  /** capture text here in the case of json parse failure we can include it in the error */
  const responseText = await response.text()
  if (!response.ok) {
    throw fetcherError(
      "An error occurred while fetching",
      response,
      responseText,
    )
  }
  try {
    const json = JSON.parse(responseText)
    return json
  } catch (parseError) {
    throw fetcherError(
      "An error occurred while parsing",
      response,
      responseText,
    )
  }
}

export const fetcherWithArgentApiHeadersForNetwork = (
  network: PublicNetworkIds,
  fetcherImpl: Fetcher = fetcher,
) => {
  const fetcherWithArgentApiHeaders = (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    const initWithArgentApiHeaders = {
      ...init,
      headers: {
        ...init?.headers,
        ...argentApiHeadersForNetwork(network),
      },
    }
    return fetcherImpl(input, initWithArgentApiHeaders)
  }
  return fetcherWithArgentApiHeaders
}

/** convert KnownNetworksType to 'goerli' or 'mainnet' expected by API */

export const argentApiNetworkForNetwork = (network: PublicNetworkIds) => {
  return network === "goerli-alpha" ? "goerli" : "mainnet"
}

export const argentApiHeadersForNetwork = (network: PublicNetworkIds) => {
  return {
    "argent-version": process.env.VERSION || "Unknown version",
    "argent-client": "argent-x",
    "argent-network": argentApiNetworkForNetwork(network),
  }
}
