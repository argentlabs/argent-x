import { Address } from "@argent/shared"

import { Network } from "../../../../shared/network"
import { mockNetworks } from "../../../features/networks/NetworkSwitcher/NetworkSwitcher.test"
import { messageClient } from "../../messaging/trpc"
import { TokenService } from "../implementation"

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
          networkId: "goerli-alpha",
          balance: "100",
        },
        {
          address: "0x456",
          networkId: "goerli-alpha",
          balance: "200",
        },
      ]),
    },
  },
} as unknown as jest.Mocked<typeof messageClient>

describe("TokenService", () => {
  let testClass: TokenService

  beforeEach(() => {
    testClass = new TokenService(messageClientMock)
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

  describe("fetchFeeTokenBalance", () => {
    it("should return the fee token balance for an account", async () => {
      // Mock the trpcMessageClient.tokens.getAccountBalance.query method
      vi.mock("../../../features/accountTokens/tokens.state", () => ({
        getNetworkFeeToken: vi.fn().mockReturnValue(
          Promise.resolve({
            address: "0x123",
            symbol: "TKN",
            networkId: "1",
            name: "Token",
            decimals: 18,
          }),
        ),
      }))
      messageClientMock.tokens.getAccountBalance.query = vi
        .fn()
        .mockResolvedValue({
          address: "0x123",
          networkId: "1",
          account: {
            address: "0x789",
            networkId: "1",
          },
          balance: "500",
        })

      const result = await testClass.fetchFeeTokenBalance("0x123", "1")

      expect(result).toEqual("500")
      expect(
        messageClientMock.tokens.getAccountBalance.query,
      ).toHaveBeenCalledWith({
        tokenAddress: expect.any(String),
        accountAddress: "0x123",
        networkId: "1",
      })
    })
  })

  describe("fetchFeeTokenBalanceForAllAccounts", () => {
    it("should return the fee token balances for all accounts", async () => {
      // Mock the trpcMessageClient.tokens.getAccountBalance.query method
      messageClientMock.tokens.getAccountBalance.query = vi
        .fn()
        .mockImplementation(({ accountAddress }) => {
          if (accountAddress === "0x789") {
            return Promise.resolve({
              address: "0x123",
              networkId: "2",
              account: {
                address: "0x789",
                networkId: "2",
              },
              balance: "1000",
            })
          }
          if (accountAddress === "0xabc") {
            return Promise.resolve({
              address: "0x123",
              networkId: "2",
              account: {
                address: "0xabc",
                networkId: "2",
              },
              balance: "2000",
            })
          }
        })

      const network: Network = {
        ...mockNetworks[1],
        multicallAddress: "0xmulticall",
      }

      const result = await testClass.fetchFeeTokenBalanceForAllAccounts(
        ["0x789", "0xabc"],
        network,
      )

      expect(result).toEqual({
        "0x789": BigInt(1000).toString(),
        "0xabc": BigInt(2000).toString(),
      })
      expect(
        messageClientMock.tokens.getAccountBalance.query,
      ).toHaveBeenCalledTimes(2)
      expect(
        messageClientMock.tokens.getAccountBalance.query,
      ).toHaveBeenNthCalledWith(1, {
        tokenAddress: expect.any(String),
        accountAddress: "0x789",
        networkId: "2",
      })
      expect(
        messageClientMock.tokens.getAccountBalance.query,
      ).toHaveBeenNthCalledWith(2, {
        tokenAddress: expect.any(String),
        accountAddress: "0xabc",
        networkId: "2",
      })
    })
  })
  describe("fetchFeeTokenBalance", () => {
    it("should throw an error if fee token is not found", async () => {
      const module = await import(
        "../../../features/accountTokens/tokens.state"
      )
      module.getNetworkFeeToken = vi.fn().mockResolvedValueOnce(null)
      const network: Network = {
        ...mockNetworks[0],
        multicallAddress: "0xmulticall",
        feeTokenAddress: undefined,
      }

      await expect(() =>
        testClass.fetchFeeTokenBalanceForAllAccounts(
          ["0x789", "0xabc"],
          network,
        ),
      ).rejects.toThrowError("Fee token not found")
    })
  })
})
