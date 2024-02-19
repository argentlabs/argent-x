import { constants } from "starknet"
import { BaseToken } from "./types/token.model"

export const ETH: Record<string, BaseToken> = {
  [constants.StarknetChainId.SN_MAIN]: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    networkId: "mainnet-alpha",
  },
  [constants.StarknetChainId.SN_GOERLI]: {
    address:
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    networkId: "goerli-alpha",
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
  [constants.StarknetChainId.SN_GOERLI]: {
    address:
      "0x005a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
    networkId: "goerli-alpha",
  },
  [constants.StarknetChainId.SN_SEPOLIA]: {
    address:
      "0x03a909c1f2d1900d0c96626fac1bedf1e82b92110e5c529b05f9138951b93535",
    networkId: "sepolia-alpha",
  },
}
