import type { Network } from "./type"

const DEV_ONLY_NETWORKS: Network[] = [
  {
    id: "integration",
    name: "Integration",
    chainId: "SN_GOERLI",
    baseUrl: "https://external.integration.starknet.io",
    accountClassHash: {
      standard:
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    status: "unknown",
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
      standard:
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    status: "unknown",
    readonly: true,
  },
  {
    id: "goerli-alpha",
    name: "Testnet",
    chainId: "SN_GOERLI",
    baseUrl: "https://alpha4.starknet.io",
    explorerUrl: "https://goerli.voyager.online",
    accountClassHash: {
      standard:
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
      plugin:
        "0x4ee23ad83fb55c1e3fac26e2cd951c60abf3ddc851caa9a7fbb9f5eddb2091",
      betterMulticall:
        "0x057c2f22f0209a819e6c60f78ad7d3690f82ade9c0c68caea492151698934ede",
      argent5MinuteEscapeTestingAccount:
        "0x058a42e2553e65e301b7f22fb89e4a2576e9867c1e20bb1d32746c74ff823639",
      multisig:
        "0x04ba0f956a26b5e0d7e491661a0c56a6eb0fc25d49912677de09439673c3c828",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    status: "unknown",
    readonly: true,
  },
  {
    id: "goerli-alpha-2",
    name: "Testnet 2",
    chainId: "SN_GOERLI2",
    baseUrl: "https://alpha4-2.starknet.io",
    explorerUrl: "https://goerli-2.voyager.online/",
    accountClassHash: {
      standard:
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
      plugin:
        "0x4ee23ad83fb55c1e3fac26e2cd951c60abf3ddc851caa9a7fbb9f5eddb2091",
      multisig:
        "0x04ba0f956a26b5e0d7e491661a0c56a6eb0fc25d49912677de09439673c3c828",
      betterMulticall:
        "0x057c2f22f0209a819e6c60f78ad7d3690f82ade9c0c68caea492151698934ede",
      argent5MinuteEscapeTestingAccount:
        "0x058a42e2553e65e301b7f22fb89e4a2576e9867c1e20bb1d32746c74ff823639",
    },
    multicallAddress:
      "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4",
    status: "unknown",
  },
  ...(process.env.NODE_ENV === "development" ? DEV_ONLY_NETWORKS : []),
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    baseUrl: "http://localhost:5050",
    explorerUrl: "https://devnet.starkscan.co",
    status: "ok",
    name: "Localhost 5050",
  },
]

export const defaultNetwork = defaultNetworks[0] // default to mainnet. Previously was testnet.
