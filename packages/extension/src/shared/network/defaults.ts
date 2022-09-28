import { Network } from "./type"

const integrationNetwork: Network = {
  id: "integration",
  name: "Integration",
  chainId: "SN_GOERLI",
  baseUrl: "https://external.integration.starknet.io",
  accountClassHash: {
    argentAccount:
      "0x389a968f62e344b2e08a50e091987797a74b34840840022fd797769230a9d3f",
  },
}

export const defaultNetworks: Network[] = [
  {
    id: "mainnet-alpha",
    name: "Mainnet",
    chainId: "SN_MAIN",
    baseUrl: "https://alpha-mainnet.starknet.io",
    explorerUrl: "https://voyager.online",
    accountClassHash: {
      argentAccount:
        "0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328",
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
        "0x2a99800326efd46f5c8066c17dcace4069a294a9044f6f767894d6bfdf9580",
      argentPluginAccount:
        "0x7e28fb0161d10d1cf7fe1f13e7ca57bce062731a3bd04494dfd2d0412699727",
    },
    multicallAddress:
      "0x042a12c5a641619a6c58e623d5735273cdfb0e13df72c4bacb4e188892034bd6",
    readonly: true,
  },
  ...(process.env.NODE_ENV === "development" ? [integrationNetwork] : []),
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    baseUrl: "http://localhost:5050",
    name: "Localhost 5050",
  },
]

export const defaultNetwork = defaultNetworks[1]
