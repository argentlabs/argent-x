/** generic json fetcher */

import { KnownNetworksType } from "../networks"

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<any>

export const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, init)
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
    "argent-version": process.env.VERSION || "",
    "argent-client": "argent-x",
    "argent-network": argentApiNetworkForNetwork(network),
  }
}
