import { constants } from "starknet"
import type { BaseToken } from "./types/token.model"

export const ETH: Record<string, BaseToken> = {
  [constants.StarknetChainId.SN_MAIN]: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    networkId: "mainnet-alpha",
  },
  [constants.StarknetChainId.SN_SEPOLIA]: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    networkId: "sepolia-alpha",
  },
}

export const USDC: Record<string, BaseToken> = {
  [constants.StarknetChainId.SN_MAIN]: {
    address:
      "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    networkId: "mainnet-alpha",
  },
  [constants.StarknetChainId.SN_SEPOLIA]: {
    address:
      "0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080",
    networkId: "sepolia-alpha",
  },
}
