import { constants } from "starknet"

import { describe, expect, test } from "vitest"

import { getChainIdFromNetworkId } from "./network"
import { NetworkError } from "../../errors/network"

describe("chains/starknet/network", () => {
  describe("network", () => {
    describe("get chain id", () => {
      test("should retrieve mainnet using networkId", () => {
        const chainId = getChainIdFromNetworkId("mainnet-alpha")
        expect(chainId).toBe(constants.StarknetChainId.SN_MAIN)
      })

      test("should retrieve mainnet using starknetjs network name", () => {
        const chainId = getChainIdFromNetworkId(constants.NetworkName.SN_MAIN)
        expect(chainId).toBe(constants.StarknetChainId.SN_MAIN)
      })

      test("should retrieve testnet using networkId", () => {
        const chainId = getChainIdFromNetworkId("goerli-alpha")
        expect(chainId).toBe(constants.StarknetChainId.SN_GOERLI)
      })

      test("should retrieve testnet using starknetjs network name", () => {
        const chainId = getChainIdFromNetworkId(constants.NetworkName.SN_GOERLI)
        expect(chainId).toBe(constants.StarknetChainId.SN_GOERLI)
      })
    })
    describe("when invalid", () => {
      test("should throw error when empty", () => {
        expect(() => getChainIdFromNetworkId("")).toThrowError(
          new NetworkError({
            code: "NOT_FOUND",
            message: `Unknown networkId: `,
          }),
        )
      })

      test("should throw error when random string", () => {
        expect(() =>
          getChainIdFromNetworkId("this-network-does-not-exist"),
        ).toThrowError(
          new NetworkError({
            code: "NOT_FOUND",
            message: `Unknown networkId: this-network-does-not-exist`,
          }),
        )
      })
    })
  })
})
