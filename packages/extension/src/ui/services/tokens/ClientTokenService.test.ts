import type { Address } from "@argent/x-shared"

import type { messageClient } from "../trpc"
import { ClientTokenService } from "./ClientTokenService"
import type { Mocked } from "vitest"

const messageClientMock = {
  tokens: {
    fetchDetails: {
      query: vi.fn().mockResolvedValue({
        decimals: 18,
        name: "Token",
        symbol: "TKN",
      }),
    },
    getAccountBalance: {
      query: vi.fn().mockResolvedValue(BigInt(100)),
    },
    getAllTokenBalances: {
      query: vi.fn().mockResolvedValue([
        {
          address: "0x123",
          networkId: "sepolia-alpha",
          balance: "100",
        },
        {
          address: "0x456",
          networkId: "sepolia-alpha",
          balance: "200",
        },
      ]),
    },
  },
} as unknown as Mocked<typeof messageClient>

describe("TokenService", () => {
  let testClass: ClientTokenService

  beforeEach(() => {
    testClass = new ClientTokenService(messageClientMock)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("fetchDetails", () => {
    it("should return merged token details", async () => {
      // Mock the trpcMessageClient.tokens.fetchDetails.query method
      messageClientMock.tokens.fetchDetails.query = vi.fn().mockResolvedValue({
        decimals: 18,
        name: "Token",
        symbol: "TKN",
      })

      const result = await testClass.fetchDetails("0x123", "1")

      expect(result).toEqual({
        address: "0x123",
        decimals: 18,
        name: "Token",
        symbol: "TKN",
      })
      expect(messageClientMock.tokens.fetchDetails.query).toHaveBeenCalledWith({
        address: "0x123",
        networkId: "1",
      })
    })
  })

  describe("toTokenView", () => {
    it("should convert TokenDetailsWithBalance to TokenView", () => {
      const detailsWithBalance = {
        name: "Token",
        symbol: "TKN",
        decimals: 18,
        balance: BigInt(100),
        otherProp: "value",
        networkId: "net1",
        address: "0x123" as Address,
      }

      const result = testClass.toTokenView(detailsWithBalance)

      expect(result).toEqual({
        name: "Token",
        symbol: "TKN",
        decimals: 18,
        balance: "0.0",
        otherProp: "value",
        networkId: "net1",
        address: "0x123",
      })
    })
  })

  describe("getAccountBalance", () => {
    it("should return the account balance for a token", async () => {
      // Mock the trpcMessageClient.tokens.getAccountBalance.query method
      messageClientMock.tokens.getAccountBalance.query = vi
        .fn()
        .mockResolvedValue({
          address: "0x123",
          networkId: "1",
          account: {
            address: "0x789",
            networkId: "1",
          },
          balance: "100",
        })

      const result = await testClass.getAccountBalance("0x123", "0x789", "1")

      expect(result).toEqual({
        address: "0x123",
        networkId: "1",
        account: {
          address: "0x789",
          networkId: "1",
        },
        balance: "100",
      })
      expect(
        messageClientMock.tokens.getAccountBalance.query,
      ).toHaveBeenCalledWith({
        tokenAddress: "0x123",
        accountAddress: "0x789",
        networkId: "1",
      })
    })
  })

  describe("getAllTokensBalance", () => {
    it("should return the balances of multiple tokens for an account", async () => {
      // Mock the trpcMessageClient.tokens.fetchAccountBalance.query method
      messageClientMock.tokens.getAccountBalance.query = vi
        .fn()
        .mockImplementation(({ tokenAddress }) => {
          if (tokenAddress === "0x123") {
            return Promise.resolve(BigInt(100))
          }
          if (tokenAddress === "0x456") {
            return Promise.resolve(BigInt(200))
          }
        })

      const result = await testClass.getAllTokenBalances(
        ["0x123", "0x456"],
        "0x789",
        "1",
      )

      expect(result).toEqual({
        "0x123": BigInt(100).toString(),
        "0x456": BigInt(200).toString(),
      })
      expect(
        messageClientMock.tokens.getAllTokenBalances.query,
      ).toHaveBeenCalledTimes(1)
      expect(
        messageClientMock.tokens.getAllTokenBalances.query,
      ).toHaveBeenNthCalledWith(1, {
        tokenAddresses: ["0x123", "0x456"],
        accountAddress: "0x789",
        networkId: "1",
      })
    })
  })
})
