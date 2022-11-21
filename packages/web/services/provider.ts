import { Multicall } from "@argent/x-multicall"
import { getDefaultProvider, providers } from "ethers"
import { SequencerProvider } from "starknet"

export const provider = new SequencerProvider({ network: "mainnet-alpha" })
export const multicallProvider = new Multicall(provider as any, undefined, {
  batchInterval: 200,
})

export const l1Provider: providers.BaseProvider | undefined =
  getDefaultProvider("mainnet")
