import { Multicall } from "@argent/x-multicall"
import { SequencerProvider } from "starknet"

export const provider = new SequencerProvider({ network: "mainnet-alpha" })
export const multicallProvider = new Multicall(provider as any, undefined, {
  batchInterval: 200,
})
