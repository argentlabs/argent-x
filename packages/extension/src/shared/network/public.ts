export type PublicNetworkIds = "mainnet-alpha" | "goerli-alpha"

export const publicNetworkIds: PublicNetworkIds[] = [
  "mainnet-alpha",
  "goerli-alpha",
]

export const isPublicNetwork = (
  networkId: string,
): networkId is PublicNetworkIds =>
  (publicNetworkIds as string[]).includes(networkId)
