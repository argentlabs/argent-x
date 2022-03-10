import { Provider } from "starknet"

import { WalletAccount } from "./wallet.model"

export interface Network {
  id: string
  name: string
  baseUrl?: string
  explorerUrl?: string
  accountImplementation?: string
}

export const networks: Network[] = [
  {
    id: "mainnet-alpha",
    name: "Ethereum Mainnet",
    explorerUrl: "https://voyager.online",
    accountImplementation:
      "0x05f28c66afd8a6799ddbe1933bce2c144625031aafa881fa38fa830790eff204",
  },
  {
    id: "goerli-alpha",
    name: "Goerli Testnet",
    explorerUrl: "https://goerli.voyager.online",
    accountImplementation:
      "0x0090aa7a9203bff78bfb24f0753c180a33d4bad95b1f4f510b36b00993815704",
  },
  {
    id: "localhost",
    name: "Localhost",
  },
]

export const defaultNetwork = networks[1] // goerli-alpha

export const getNetwork = (networkId: string): Network => {
  networkId = localNetworkId(networkId)
  return networks.find(({ id }) => id === networkId) || defaultNetwork
}

export const accountsOnNetwork = (
  accounts: WalletAccount[],
  networkId: string,
) =>
  accounts.filter(
    ({ network }) => localNetworkId(network) === localNetworkId(networkId),
  )

export const localNetworkId = (network: string) =>
  network.startsWith("http://localhost") ? "localhost" : network

export const localNetworkUrl = (networkId: string, port: number) => {
  if (networkId.startsWith("http://localhost")) {
    return networkId
  }
  return networkId === "localhost" ? `http://localhost:${port}` : networkId
}

export const getProvider = (network: string) =>
  new Provider(
    network.startsWith("http")
      ? { baseUrl: network }
      : { network: network as any },
  )
