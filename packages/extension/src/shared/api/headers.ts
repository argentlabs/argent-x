import type { ArgentBackendNetworkId, ArgentNetworkId } from "@argent/x-shared"

const makeArgentXHeaders = () => ({
  "argent-version": process.env.VERSION || "Unknown version",
  "argent-client": "argent-x",
})

export const argentXHeaders = makeArgentXHeaders()

/** convert KnownNetworksType to 'goerli' or 'mainnet' expected by API */

export const argentApiNetworkForNetwork = (
  network: ArgentNetworkId | string,
): ArgentBackendNetworkId | null => {
  switch (network) {
    case "goerli-alpha":
      return "goerli"
    case "sepolia-alpha":
      return "sepolia"
    case "mainnet-alpha":
      return "mainnet"
  }
  return null
}

export const argentApiHeadersForNetwork = (network: string) => {
  const argentNetwork = argentApiNetworkForNetwork(network)
  const defaultHeaders = makeArgentXHeaders()
  if (!argentNetwork) {
    return defaultHeaders
  }
  return {
    ...defaultHeaders,
    "argent-network": argentNetwork,
  }
}
