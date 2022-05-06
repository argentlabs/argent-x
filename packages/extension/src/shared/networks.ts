import { Provider } from "starknet"
import { SchemaOf, boolean, object, string } from "yup"

import { WalletAccount } from "./wallet.model"

export interface Network {
  id: string
  name: string
  chainId: string
  baseUrl: string
  explorerUrl?: string
  accountImplementation?: string
  rpcUrl?: string
  readonly?: boolean
}

export type NetworkStatus = "ok" | "degraded" | "error" | "unknown"

export const defaultNetworks: Network[] = [
  {
    id: "mainnet-alpha",
    name: "Ethereum Mainnet",
    chainId: "SN_MAIN",
    baseUrl: "https://alpha-mainnet.starknet.io",
    explorerUrl: "https://voyager.online",
    accountImplementation:
      "0x01bd7ca87f139693e6681be2042194cf631c4e8d77027bf0ea9e6d55fc6018ac",
    readonly: true,
  },
  {
    id: "goerli-alpha",
    name: "Goerli Testnet",
    chainId: "SN_GOERLI",
    baseUrl: "https://alpha4.starknet.io",
    explorerUrl: "https://goerli.voyager.online",
    accountImplementation:
      "0x070a61892f03b34f88894f0fb9bb4ae0c63a53f5042f79997862d1dffb8d6a30",
    readonly: true,
  },
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    baseUrl: "http://localhost:5050",
    name: "Localhost 5050",
  },
]

const REGEX_HEXSTRING = /^0x[a-f0-9]+$/i
const REGEX_URL_WITH_LOCAL =
  /^(https?:\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/

export const NetworkSchema: SchemaOf<Network> = object()
  .required()
  .shape({
    id: string().required().min(2).max(31),
    name: string().required().min(2).max(128),
    chainId: string()
      .required()
      .min(2)
      .max(31) // max 31 characters as required by starknet short strings
      .matches(/^[A-Z0-9_]+$/, {
        message:
          "${path} must be uppercase alphanumeric or underscore, like 'SN_GOERLI'",
      }),
    baseUrl: string()
      .required()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    accountImplementation: string().optional().matches(REGEX_HEXSTRING),
    explorerUrl: string()
      .optional()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    rpcUrl: string()
      .optional()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    readonly: boolean().optional(),
  })

export const defaultNetwork = defaultNetworks[1] // goerli-alpha

export const getNetwork = (
  networkId: string,
  allNetworks: Network[],
): Network => {
  return allNetworks.find(({ id }) => id === networkId) || defaultNetwork
}

export type KnownNetworksType = "mainnet-alpha" | "goerli-alpha"
export const knownNetworks: KnownNetworksType[] = [
  "mainnet-alpha",
  "goerli-alpha",
]
export const isKnownNetwork = (
  networkId: string,
): networkId is KnownNetworksType =>
  (knownNetworks as string[]).includes(networkId)

export const accountsOnNetwork = (
  accounts: WalletAccount[],
  networkId: string,
) => accounts.filter(({ network }) => network.id === networkId)

export const getProvider = (network: Network) => {
  if (isKnownNetwork(network.id)) {
    return new Provider({ network: network.id })
  }
  return new Provider({ baseUrl: network.baseUrl })
}
