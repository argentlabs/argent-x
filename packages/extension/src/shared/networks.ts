export interface Network {
  id: string
  name: string
  explorerUrl: string
}

export const defaultNetworks: Network[] = [
  {
    id: "mainnet",
    name: "Ethereum Mainnet",
    explorerUrl: "https://voyager.online/",
  },
  {
    id: "fake",
    name: "Fake Testnet",
    explorerUrl: "https://fake.voyager.online/",
  },
  {
    id: "goerli",
    name: "Goerli Testnet",
    explorerUrl: "https://goerli.voyager.online/",
  },
]

export const getNetwork = (networkId: string) =>
  defaultNetworks.find(({ id }) => id === networkId) || defaultNetworks[0]
