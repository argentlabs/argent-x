/** generic json fetcher */

import { KnownNetworksType } from "../networks"

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<any>

export interface FetcherError extends Error {
  status?: number
  statusText?: string
  responseText?: string
}

export const fetcherErrorForResponse = async (response: Response) => {
  const error: FetcherError = new Error("An error occurred while fetching")
  error.status = response.status
  error.statusText = response.statusText
  error.responseText = await response.text()
  return error
}

export const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, init)
  if (!response.ok) {
    const error = await fetcherErrorForResponse(response)
    throw error
  }
  const json = await response.json()
  return json
}

export const fetcherWithArgentApiHeadersForNetwork = (
  network: KnownNetworksType,
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

export const argentApiNetworkForNetwork = (network: KnownNetworksType) => {
  return network === "goerli-alpha" ? "goerli" : "mainnet"
}

export const argentApiHeadersForNetwork = (network: KnownNetworksType) => {
  return {
    "argent-version": process.env.VERSION || "Unknown version",
    "argent-client": "argent-x",
    "argent-network": argentApiNetworkForNetwork(network),
  }
}
