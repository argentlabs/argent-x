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
      "0x02acfa68f063b35ffd9e6a6b77ba0d7ad231d1a64f9fa8c5770e0be376e17ef9",
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
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
    },
    multicallAddress:
      "0x0740a7a14618bb7e4688d10059bc42104d22c315bb647130630c77d3b6d3ee50",
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
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
      argentPluginAccount:
        "0x4ee23ad83fb55c1e3fac26e2cd951c60abf3ddc851caa9a7fbb9f5eddb2091",
    },
    multicallAddress:
      "0x042a12c5a641619a6c58e623d5735273cdfb0e13df72c4bacb4e188892034bd6",
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
        "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
      argentPluginAccount:
        "0x4ee23ad83fb55c1e3fac26e2cd951c60abf3ddc851caa9a7fbb9f5eddb2091",
    },
    multicallAddress:
      "0x0648aa7b71687449382180c76fd2871e1e77ccb6775e8d29b79e3d8c8b512380",
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
