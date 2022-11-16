import { Network } from "./type"

const DEV_ONLY_NETWORKS: Network[] = [
  {
    id: "integration",
    name: "Integration",
    chainId: "SN_GOERLI",
    baseUrl: "https://external.integration.starknet.io",
    accountClassHash: {
      argentAccount:
        "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
  },
]

export const defaultNetworks: Network[] = [
  {
    id: "mainnet-alpha",
    name: "Mainnet",
    chainId: "SN_MAIN",
    baseUrl: "https://alpha-mainnet.starknet.io",
    explorerUrl: "https://voyager.online",
    accountClassHash: {
      argentAccount:
        "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
      argentPluginAccount:
        "0xebe4b44d154bc07eacad202ee19757cdc73e7d4c672bc20d9031450c6db3ad",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    readonly: true,
  },
  {
    id: "goerli-alpha",
    name: "Testnet",
    chainId: "SN_GOERLI",
    baseUrl: "https://alpha4.starknet.io",
    explorerUrl: "https://goerli.voyager.online",
    accountClassHash: {
      argentAccount:
        "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
      argentPluginAccount:
        "0xebe4b44d154bc07eacad202ee19757cdc73e7d4c672bc20d9031450c6db3ad",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    readonly: true,
  },
  {
    id: "goerli-alpha-2",
    name: "Testnet 2",
    chainId: "SN_GOERLI",
    baseUrl: "https://alpha4-2.starknet.io",
    explorerUrl: "https://goerli-2.voyager.online/",
    accountClassHash: {
      argentAccount:
        "0x1a7820094feaf82d53f53f214b81292d717e7bb9a92bb2488092cd306f3993f",
      argentPluginAccount:
        "0xebe4b44d154bc07eacad202ee19757cdc73e7d4c672bc20d9031450c6db3ad",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
  },
  ...(process.env.NODE_ENV === "development" ? DEV_ONLY_NETWORKS : []),
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    baseUrl: "http://localhost:5050",
    name: "Localhost 5050",
  },
]

export const defaultNetwork = defaultNetworks[1]
