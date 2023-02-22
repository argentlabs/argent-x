/** generic json fetcher */

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<any>

export interface FetcherError extends Error {
  url?: string
  status?: number
  statusText?: string
  responseText?: string
  responseJson?: any
}

export const isFetcherError = (error: any): error is FetcherError => {
  return error?.name === "FetcherError"
}

export const fetcherError = (
  message: string,
  response: Response,
  responseText: string,
) => {
  const error: FetcherError = new Error(message)
  error.name = "FetcherError"
  error.url = response.url
  error.status = response.status
  error.statusText = response.statusText
  error.responseText = responseText
  try {
    const reponseJson = JSON.parse(responseText)
    error.responseJson = reponseJson
  } catch {
    // ignore error
  }
  return error
}

export const fetcher = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
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
  network: string,
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

export const argentApiNetworkForNetwork = (network: string) => {
  return network === "goerli-alpha"
    ? "goerli"
    : network === "mainnet-alpha"
    ? "mainnet"
    : null
}

export const argentApiHeadersForNetwork = (network: string) => {
  const argentNetwork = argentApiNetworkForNetwork(network)
  return {
    "argent-version": process.env.VERSION || "Unknown version",
    "argent-client": "argent-x",
    ...(argentNetwork && { "argent-network": argentNetwork }),
  }
}
