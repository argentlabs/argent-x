export interface Network {
  id: string
  name: string
  explorerUrl: string
}

export const defaultNetworkId = "goerli-alpha"

export const defaultNetworks: Network[] = [
  {
    id: "mainnet-alpha",
    name: "Ethereum Mainnet",
    explorerUrl: "https://voyager.online",
  },
  {
    id: "goerli-alpha",
    name: "Goerli Testnet",
    explorerUrl: "https://goerli.voyager.online",
  },
]

export const getNetwork = (networkId: string) =>
  defaultNetworks.find(({ id }) => id === networkId) || defaultNetworks[0]
