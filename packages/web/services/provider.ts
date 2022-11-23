import { Multicall } from "@argent/x-multicall"
import { getDefaultProvider, providers } from "ethers"
import { SequencerProvider } from "starknet"

const SELECTED_NETWORK: keyof typeof networks = "testnet2"

const networks = {
  mainnet: { starknetProvider: "mainnet-alpha", ethersProvider: "mainnet" },
  testnet: { starknetProvider: "goerli-alpha", ethersProvider: "goerli" },
  testnet2: { starknetProvider: "goerli-alpha-2", ethersProvider: "goerli" },
} as const

const network = networks[SELECTED_NETWORK]

export const provider = new SequencerProvider({
  network: network.starknetProvider,
})
export const multicallProvider = new Multicall(provider as any, undefined, {
  batchInterval: 200,
})

export const l1Provider: providers.BaseProvider | undefined =
  getDefaultProvider(network.ethersProvider)
