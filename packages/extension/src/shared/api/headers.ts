const makeArgentXHeaders = () => ({
  "argent-version": process.env.VERSION || "Unknown version",
  "argent-client": "argent-x",
})

export const argentXHeaders = makeArgentXHeaders()

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
  const defaultHeaders = makeArgentXHeaders()
  if (!argentNetwork) {
    return defaultHeaders
  }
  return {
    ...defaultHeaders,
    "argent-network": argentNetwork,
  }
}
