/** generic json fetcher */

import type { NetworkInfo } from "./../../shared/network_log"
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
  const networkLogs = useNetworkLogsStore.getState().networkLogs
  let log: NetworkInfo = {
    url: init?.url || input.url,
  }
  if (typeof input === "RequestInfo") {
    log = {
      ...log,
      headers: input.headers,
      method: input.method,
      body: (input as RequestInfo).body,
    }
  }
  if (init?.headers) {
    log.headers = init.headers
  }
  if (init?.method) {
    log.method = init.method
  }
  if (init?.body) {
    log.body = init.body
  }

  networkLogs.push(log)
  useNetworkLogsStore.setState(log)
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
