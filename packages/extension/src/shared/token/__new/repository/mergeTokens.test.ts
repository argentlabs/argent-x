import { describe, test } from "vitest"

import type { Token } from "../types/token.model"
import { mergeTokens, mergeTokensWithDefaults } from "./mergeTokens"
import {
  getMockApiTokenDetails,
  getMockToken,
} from "../../../../../test/token.mock"

const MOCK_TOKEN_1: Token = {
  symbol: "MOCK1",
  address: "0x1",
  networkId: "mainnet-alpha",
  name: "Mock1",
  decimals: 18,
}

const MOCK_TOKEN_2: Token = {
  symbol: "MOCK2",
  address: "0x2",
  networkId: "mainnet-alpha",
  name: "Mock2",
  decimals: 18,
}

const MOCK_TOKEN_3: Token = {
  symbol: "MOCK3",
  address: "0x3",
  networkId: "mainnet-alpha",
  name: "Mock3",
  decimals: 18,
}

describe("shared/token/repository", () => {
  describe("mergeTokens", () => {
    test("merges tokens, keeping old values and updating new values", () => {
      const firstToken = MOCK_TOKEN_1
      const secondToken: Token = {
        ...MOCK_TOKEN_1,
        name: "Mock1Updated",
        pricingId: 1,
      }
      expect(mergeTokens(secondToken, firstToken)).toEqual({
        address: "0x1",
        decimals: 18,
        name: "Mock1Updated",
        networkId: "mainnet-alpha",
        pricingId: 1,
        symbol: "MOCK1",
      })
    })
    test("when there are no tags", () => {
      const mockToken = getMockToken()
      const mockApiToken = {
        ...getMockApiTokenDetails(),
        networkId: "mainnet-alpha",
      }
      const merged = mergeTokens(mockApiToken, mockToken)
      expect(merged).toEqual({
        address: "0x123",
        category: "tokens",
        decimals: 18,
        iconUrl: "https://example.com",
        id: 1,
        listed: true,
        name: "Token",
        networkId: "mainnet-alpha",
        popular: true,
        pricingId: 1,
        refundable: true,
        sendable: true,
        symbol: "TKN",
        tradable: true,
      })
    })
    test("when there are tags in both", () => {
      const mockToken = getMockToken({ tags: ["defi"] })
      const mockApiToken = getMockToken({ tags: ["defi", "scam"] })
      const merged = mergeTokens(mockApiToken, mockToken)
      expect(merged.tags).toEqual(["defi", "scam"])
    })
    test("when there are tags locally, but not in api", () => {
      const mockToken = getMockToken({ tags: ["scam"] })
      const mockApiToken = getMockToken()
      const merged = mergeTokens(mockApiToken, mockToken)
      expect(merged.tags).toBeUndefined()
    })
  })
  describe("mergeTokensWithDefaults", () => {
    test("merges tokens, keeping old values and updating new values, inserting new tokens", () => {
      const tokens: Token[] = [
        {
          ...MOCK_TOKEN_1,
          name: "Mock1Existing",
          pricingId: 1,
        },
        {
          ...MOCK_TOKEN_2,
          name: "Mock2Existing",
          iconUrl: "https://foo.bar",
        },
      ]
      const defaultTokens = [MOCK_TOKEN_1, MOCK_TOKEN_2, MOCK_TOKEN_3]
      expect(mergeTokensWithDefaults(tokens, defaultTokens)).toEqual([
        MOCK_TOKEN_3,
        {
          address: "0x1",
          decimals: 18,
          name: "Mock1Existing",
          networkId: "mainnet-alpha",
          pricingId: 1,
          symbol: "MOCK1",
        },
        {
          address: "0x2",
          decimals: 18,
          iconUrl: "https://foo.bar",
          name: "Mock2Existing",
          networkId: "mainnet-alpha",
          symbol: "MOCK2",
        },
      ])
    })
  })
})
