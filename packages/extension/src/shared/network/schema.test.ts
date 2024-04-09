import { describe, test, expect } from "vitest"

import {
  mainnetChainIdSchema,
  notMainnetChainIdSchema,
  notMainnetChainIdNetworkSchema,
} from "./schema"

describe("shared/network/schema", () => {
  describe("mainnetChainIdSchema", () => {
    describe("when valid", () => {
      test("parses", () => {
        expect(() => mainnetChainIdSchema.parse("SN_MAIN")).not.toThrow()
        expect(() => mainnetChainIdSchema.parse("sn_Main")).not.toThrow()
      })
    })
    describe("when invalid", () => {
      test("throws", () => {
        expect(() => mainnetChainIdSchema.parse("SN_GOERLI")).toThrowError(
          "Invalid enum value. Expected 'SN_MAIN' | '0X534E5F4D41494E', received 'SN_GOERLI'",
        )
      })
    })
  })
  describe("notMainnetChainIdSchema", () => {
    describe("when valid", () => {
      test("parses", () => {
        expect(() => notMainnetChainIdSchema.parse("SN_GOERLI")).not.toThrow()
      })
    })
    describe("when invalid", () => {
      test("throws", () => {
        expect(() =>
          notMainnetChainIdSchema.parse("0x534e5F4D41494E"),
        ).toThrowError("Chain ID is reserved")
        expect(() => notMainnetChainIdSchema.parse("SN_MAIN")).toThrowError(
          "Chain ID is reserved",
        )
        expect(() =>
          notMainnetChainIdSchema.parse("0x534e5f4d41494e"),
        ).toThrowError("Chain ID is reserved")
        expect(() => notMainnetChainIdSchema.parse("sn_Main")).toThrowError(
          "Chain ID is reserved",
        )
      })
    })
  })
  describe("notMainnetChainIdNetworkSchema", () => {
    describe("when valid", () => {
      test("parses", () => {
        expect(() =>
          notMainnetChainIdNetworkSchema.parse({
            name: "Test",
            id: "dapp-test",
            chainId: "SN_DAPP_TEST",
            chainName: "Test chain name",
            baseUrl: "http://localhost:5050",
            rpcUrl: "http://localhost:5050/rpc",
            possibleFeeTokenAddresses: [
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            ],
          }),
        ).not.toThrow()
      })
    })
    describe("when invalid", () => {
      test("throws", () => {
        expect(() =>
          notMainnetChainIdNetworkSchema.parse({
            name: "Test",
            id: "dapp-test",
            chainId: "SN_MAIN",
            chainName: "Test chain name",
            baseUrl: "http://localhost:5050",
            rpcUrl: "http://localhost:5050/rpc",
            possibleFeeTokenAddresses: [
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            ],
          }),
        ).toThrowError("Chain ID is reserved")
        expect(() =>
          notMainnetChainIdNetworkSchema.parse({
            name: "Test",
            id: "dapp-test",
            chainId: "0x534e5f4d41494e",
            chainName: "Test chain name",
            baseUrl: "http://localhost:5050",
            rpcUrl: "http://localhost:5050/rpc",
            possibleFeeTokenAddresses: [
              "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            ],
          }),
        ).toThrowError("Chain ID is reserved")
      })
    })
  })
})
