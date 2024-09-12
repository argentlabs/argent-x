import "fake-indexeddb/auto"

import { Mocked } from "vitest"

import { NetworkService } from "../../../network/service/NetworkService"
import { INetworkService } from "../../../network/service/INetworkService"
import { MockFnRepository } from "../../../storage/__new/__test__/mockFunctionImplementation"
import { TokenService } from "./TokenService"
import {
  getMockApiTokenDetails,
  getMockBaseToken,
  getMockBaseTokenWithBalance,
  getMockToken,
  getMockTokenPriceDetails,
} from "../../../../../test/token.mock"
import { defaultNetwork } from "../../../network"
import {
  getMockNetwork,
  getMockNetworkWithoutMulticall,
} from "../../../../../test/network.mock"
import { INetworkRepo } from "../../../network/store"
import { GatewayError, shortString, stark } from "starknet"
import {
  IHttpService,
  addressSchema,
  ensureArray,
  stripAddressZeroPadding,
} from "@argent/x-shared"
import { TokenError } from "../../../errors/token"
import { ArgentDatabase } from "../../../idb/db"
import { equalToken } from "../utils"

const BASE_INFO_ENDPOINT = "https://token.info.argent47.net/v1"
const BASE_PRICES_ENDPOINT = "https://token.prices.argent47.net/v1"

const randomAddress1 = addressSchema.parse(stark.randomAddress())
const randomAddress2 = addressSchema.parse(stark.randomAddress())

describe("TokenService", () => {
  let tokenService: TokenService
  let mockNetworkService: Mocked<INetworkService>

  let mockNetworkRepo: MockFnRepository<INetworkRepo>
  let mockHttpService: Mocked<IHttpService>
  let db: ArgentDatabase

  beforeEach(() => {
    mockNetworkRepo = new MockFnRepository()

    mockNetworkService = vi.mocked<INetworkService>(
      new NetworkService(mockNetworkRepo),
    )

    mockHttpService = {
      get: vi.fn(),
    } as unknown as Mocked<IHttpService>

    db = new ArgentDatabase()

    tokenService = new TokenService(
      mockNetworkService,
      db,
      mockHttpService,
      BASE_INFO_ENDPOINT,
      BASE_PRICES_ENDPOINT,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    db.delete()
  })

  it("should add a token", async () => {
    const mockToken = getMockToken()
    await tokenService.addToken(mockToken)

    const token = await db.tokens
      .toCollection()
      .filter((t) => equalToken(t, mockToken))
      .first()

    expect(token).toEqual(mockToken)
  })

  it("should remove a token", async () => {
    const mockBaseToken = getMockBaseToken()
    const mockToken = getMockToken()

    await db.tokens.add(mockToken)

    const prevCount = await db.tokens.count()

    await tokenService.removeToken(mockBaseToken)

    expect(await db.tokens.count()).toEqual(prevCount - 1)
  })

  it("should update tokens", async () => {
    const mockTokens = [
      getMockToken(),
      getMockToken({ address: "0x456" }),
      getMockToken({ networkId: "sepolia-alpha" }),
    ]
    await tokenService.updateTokens(mockTokens)

    expect(
      await db.tokens
        .filter((token) => mockTokens.some((t) => equalToken(token, t)))
        .toArray(),
    ).toEqual([
      getMockToken(),
      getMockToken({ networkId: "sepolia-alpha" }),
      getMockToken({ address: "0x456" }),
    ])
  })

  it("should update token balances", async () => {
    const mockTokensWithBalance = [
      getMockBaseTokenWithBalance(),
      getMockBaseTokenWithBalance({ address: "0x456", balance: "200" }),
    ]
    await tokenService.updateTokenBalances(mockTokensWithBalance)

    const tokenBalances = await db.tokenBalances.toArray()
    expect(tokenBalances).toEqual(mockTokensWithBalance)
  })

  it("should update token prices", async () => {
    const mockTokenPrices = [
      getMockTokenPriceDetails(),
      getMockTokenPriceDetails({
        address: "0x1234",
        pricingId: 2,
        ethValue: "0.36",
      }),
    ]
    await tokenService.updateTokenPrices(mockTokenPrices)
    const tokenPriceDetails = await db.tokenPrices.toArray()
    expect(tokenPriceDetails).toEqual(mockTokenPrices)
  })

  describe("get tokens info from backend", () => {
    const mockNetworkId = defaultNetwork.id
    const defaultMockApiTokeDetails = getMockApiTokenDetails()
    const mockToken1 = getMockApiTokenDetails({
      id: 1,
      address: randomAddress1,
      iconUrl: defaultMockApiTokeDetails.iconUrl,
      popular: defaultMockApiTokeDetails.popular,
      pricingId: defaultMockApiTokeDetails.pricingId,
      tradable: true,
    })
    const mockToken2 = getMockApiTokenDetails({
      id: 2,
      address: randomAddress2,
      iconUrl: defaultMockApiTokeDetails.iconUrl,
      popular: defaultMockApiTokeDetails.popular,
      pricingId: 2,
      tradable: true,
    })
    const mockTokens = [mockToken1, mockToken2]

    describe("when storage is empty", () => {
      it("should fetch tokens from backend", async () => {
        const date = new Date(2024, 1, 1, 1)
        vi.setSystemTime(date)
        mockHttpService.get.mockResolvedValueOnce({ tokens: mockTokens })
        const result =
          await tokenService.getTokensInfoFromBackendForNetwork(mockNetworkId)
        expect(mockHttpService.get).toHaveBeenCalledOnce()

        const tokensInfo = await db.tokensInfo.orderBy("id").toArray()
        expect(tokensInfo).toEqual(
          ensureArray(result).map((token) => ({
            ...token,
            address: stripAddressZeroPadding(token.address),
            updatedAt: date.getTime(),
            networkId: mockNetworkId,
          })),
        )
      })
    })

    describe("when storage has recent tokens", () => {
      it("should return tokens from storage and not fetch from backend", async () => {
        const date = new Date(2024, 1, 1, 1)
        vi.setSystemTime(date)

        const dbTokens = mockTokens.map((token) => ({
          ...token,
          networkId: mockNetworkId,
          updatedAt: date.getTime() - 1,
        }))

        await db.tokensInfo.bulkPut(dbTokens)

        mockHttpService.get.mockResolvedValueOnce({ tokens: mockTokens })
        const result =
          await tokenService.getTokensInfoFromBackendForNetwork(mockNetworkId)
        expect(mockHttpService.get).not.toHaveBeenCalled()
        expect(result).toEqual(
          dbTokens.map((token) => ({
            ...token,
            address: stripAddressZeroPadding(token.address),
          })),
        )
      })
    })

    describe("when storage has old tokens", () => {
      it("should fetch tokens from backend", async () => {
        const date = new Date(2024, 1, 1, 1)
        vi.setSystemTime(date)
        const dbTokens = mockTokens.map((token) => ({
          ...token,
          networkId: mockNetworkId,
          updatedAt: 0,
        }))

        await db.tokensInfo.bulkPut(dbTokens)

        mockHttpService.get.mockResolvedValueOnce({ tokens: mockTokens })
        await tokenService.getTokensInfoFromBackendForNetwork(mockNetworkId)
        expect(mockHttpService.get).toHaveBeenCalledOnce()

        const tokens = await db.tokensInfo.orderBy("id").toArray()

        expect(tokens).toEqual(
          mockTokens.map((token) => ({
            ...token,
            address: stripAddressZeroPadding(token.address),
            networkId: mockNetworkId,
            updatedAt: date.getTime(),
          })),
        )
      })
    })
  })

  describe("fetch account token balances from backend", () => {
    describe("when default network", async () => {
      describe("and the response is not initialised", async () => {
        it("should retry until initialised", async () => {
          const networkId = defaultNetwork.id
          mockHttpService.get
            .mockResolvedValueOnce({ status: "initialising" })
            .mockResolvedValueOnce({ status: "initialising" })
            .mockResolvedValueOnce({ status: "initialising" })
            .mockResolvedValueOnce({
              status: "initialised",
              balances: [
                {
                  tokenAddress: "0x123",
                  tokenBalance: "123",
                },
              ],
            })
          const result =
            await tokenService.fetchAccountTokenBalancesFromBackend(
              {
                address: "0x123",
                networkId,
              },
              {
                minTimeout: 0,
                maxTimeout: 0,
              },
            )
          expect(mockHttpService.get).toHaveBeenCalledTimes(4)
          expect(mockHttpService.get).toHaveBeenCalledWith(
            expect.stringMatching(
              /activity\/starknet\/(sepolia|mainnet)\/account\/0x123\/balance$/,
            ),
          )
          expect(result).toEqual([
            {
              account: "0x123",
              address:
                "0x0000000000000000000000000000000000000000000000000000000000000123",
              balance: "123",
              networkId,
            },
          ])
        })
      })
      describe("and the response is initialised", async () => {
        it("should return first response", async () => {
          const networkId = defaultNetwork.id
          mockHttpService.get.mockResolvedValueOnce({
            status: "initialised",
            balances: [
              {
                tokenAddress: "0x123",
                tokenBalance: "123",
              },
            ],
          })
          const result =
            await tokenService.fetchAccountTokenBalancesFromBackend(
              {
                address: "0x123",
                networkId,
              },
              {
                minTimeout: 0,
                maxTimeout: 0,
              },
            )
          expect(mockHttpService.get).toHaveBeenCalledTimes(1)
          expect(mockHttpService.get).toHaveBeenCalledWith(
            expect.stringMatching(
              /activity\/starknet\/(sepolia|mainnet)\/account\/0x123\/balance$/,
            ),
          )
          expect(result).toEqual([
            {
              account: "0x123",
              address:
                "0x0000000000000000000000000000000000000000000000000000000000000123",
              balance: "123",
              networkId,
            },
          ])
        })
      })
    })
    describe("when not default network", () => {
      it("should return empty array", async () => {
        const result = await tokenService.fetchAccountTokenBalancesFromBackend({
          address: "0x123",
          networkId: "invalid-network",
        })
        expect(result).toEqual([])
      })
    })
  })

  describe("fetch tokens from backend", () => {
    it("should return without fetching tokens if it is not a default network", async () => {
      const mockNetworkId = "mockNetworkId"
      const result =
        await tokenService.getTokensInfoFromBackendForNetwork(mockNetworkId)
      expect(result).toBeUndefined()
    })

    it("should return undefined if token info response is not valid", async () => {
      const invalidTokenService = new TokenService(
        mockNetworkService,
        db,
        mockHttpService,
        BASE_INFO_ENDPOINT,
        BASE_PRICES_ENDPOINT,
      )

      const mockNetworkId = defaultNetwork.id
      const defaultMockApiTokeDetails = getMockApiTokenDetails()
      const mockToken1 = getMockToken({
        address: randomAddress1,
        networkId: mockNetworkId,
        iconUrl: defaultMockApiTokeDetails.iconUrl,
        showAlways: undefined,
        custom: undefined,
        popular: defaultMockApiTokeDetails.popular,
        pricingId: defaultMockApiTokeDetails.pricingId,
      })
      const mockToken2 = getMockToken({
        address: randomAddress2,
        networkId: mockNetworkId,
        showAlways: undefined,
        iconUrl: defaultMockApiTokeDetails.iconUrl,
        custom: undefined,
        popular: defaultMockApiTokeDetails.popular,
        pricingId: 2,
      })
      const mockTokens = [mockToken1, mockToken2]

      await db.tokens.bulkPut(mockTokens)

      const result =
        await invalidTokenService.getTokensInfoFromBackendForNetwork(
          mockNetworkId,
        )
      expect(result).toBeUndefined()
    })
  })

  describe("fetch onchain token balances", () => {
    it("should fetch token balances from on-chain for same network", async () => {
      const mockNetwork = getMockNetwork()
      const mockAccount = { address: randomAddress1, networkId: mockNetwork.id }

      const mockBaseTokens = [
        getMockBaseToken({ networkId: mockNetwork.id }),
        getMockBaseToken({ address: "0x456", networkId: mockNetwork.id }),
      ]

      const mockTokens = [
        getMockToken({ ...mockBaseTokens[0] }),
        getMockToken({ ...mockBaseTokens[1] }),
      ]
      const mockTokenBalances = mockBaseTokens.map((token) => ({
        ...token,
        balance: "100",
        account: mockAccount,
      }))
      await db.tokens.bulkPut(mockTokens)

      mockNetworkRepo.get.mockResolvedValueOnce([mockNetwork])
      tokenService.fetchTokenBalancesWithMulticall = vi
        .fn()
        .mockResolvedValueOnce([
          {
            balance: "100",
            account: mockAccount,
            address: "0x123",
            networkId: mockNetwork.id,
          },
          {
            balance: "100",
            account: mockAccount,
            address: "0x456",
            networkId: mockNetwork.id,
          },
        ])

      const result =
        await tokenService.fetchTokenBalancesFromOnChain(mockAccount)
      expect(result).toEqual(mockTokenBalances)
    })

    it("should fetch token balances from on-chain for different network", async () => {
      const mockNetwork = getMockNetwork()
      const defaultMockNetwork = getMockNetwork({ id: defaultNetwork.id })
      const mockAccounts = [
        { address: randomAddress1, networkId: mockNetwork.id },
        { address: randomAddress2, networkId: defaultNetwork.id },
      ]

      const mockBaseTokens = [
        getMockBaseToken({ networkId: mockNetwork.id }),
        getMockBaseToken({ address: "0x456", networkId: mockNetwork.id }),
        getMockBaseToken({ networkId: defaultNetwork.id }),
      ]

      const mockTokens = [
        getMockToken({ ...mockBaseTokens[0] }),
        getMockToken({ ...mockBaseTokens[1] }),
        getMockToken({ ...mockBaseTokens[2] }),
      ]
      const mockTokenBalances = [
        { ...mockBaseTokens[0], balance: "100", account: mockAccounts[0] },
        { ...mockBaseTokens[1], balance: "150", account: mockAccounts[0] },
        { ...mockBaseTokens[2], balance: "1000", account: mockAccounts[1] },
      ]
      await db.tokens.bulkPut(mockTokens)

      mockNetworkRepo.get.mockResolvedValueOnce([
        mockNetwork,
        defaultMockNetwork,
      ])
      mockNetworkService.getById = vi.fn().mockImplementation((networkId) => {
        if (networkId === mockNetwork.id) {
          return mockNetwork
        } else {
          return defaultMockNetwork
        }
      })
      tokenService.fetchTokenBalancesWithMulticall = vi
        .fn()
        .mockResolvedValueOnce([
          {
            balance: "100",
            account: mockAccounts[0],
            address: "0x123",
            networkId: mockNetwork.id,
          },
          {
            balance: "150",
            account: mockAccounts[0],
            address: "0x456",
            networkId: mockNetwork.id,
          },
        ])
        .mockResolvedValueOnce([
          {
            balance: "1000",
            account: mockAccounts[1],
            address: "0x123",
            networkId: defaultNetwork.id,
          },
        ])

      const result =
        await tokenService.fetchTokenBalancesFromOnChain(mockAccounts)
      expect(result).toEqual(mockTokenBalances)
    })
  })
  describe("fetch token prices from backend", () => {
    it("should fetch token prices from backend on default network", async () => {
      const mockNetworkId = defaultNetwork.id
      const mockTokens = [
        getMockToken({ networkId: mockNetworkId, pricingId: 1 }),
        getMockToken({
          address: "0x456",
          networkId: mockNetworkId,
          pricingId: 2,
        }),
      ]
      const mockTokenPrices = mockTokens.map((token, i) =>
        getMockTokenPriceDetails({
          address: token.address,
          networkId: token.networkId,
          ethValue: ((i + 1) * 0.32).toString(),
          pricingId: i + 1,
        }),
      )
      mockHttpService.get.mockResolvedValueOnce({
        prices: [
          getMockTokenPriceDetails({ pricingId: 1, ethValue: "0.32" }),
          getMockTokenPriceDetails({ pricingId: 2, ethValue: "0.64" }),
        ],
      })
      const result = await tokenService.fetchTokenPricesFromBackend(
        mockTokens,
        defaultNetwork.id,
      )

      expect(result).toEqual(mockTokenPrices)
    })

    it("should return token prices without fetching on a different network", async () => {
      const mockNetworkId = "mainnet-alpha"
      const mockTokens = [
        getMockToken({ networkId: mockNetworkId, pricingId: 1 }),
        getMockToken({
          address: "0x456",
          networkId: mockNetworkId,
          pricingId: 2,
        }),
      ]
      const mockTokenPrices = mockTokens.map((token, i) =>
        getMockTokenPriceDetails({
          address: token.address,
          networkId: token.networkId,
          ethValue: ((i + 1) * 0.32).toString(),
          pricingId: i + 1,
        }),
      )
      mockHttpService.get.mockResolvedValueOnce({
        prices: [
          getMockTokenPriceDetails({ pricingId: 1, ethValue: "0.32" }),
          getMockTokenPriceDetails({ pricingId: 2, ethValue: "0.64" }),
        ],
      })

      await db.tokenPrices.bulkPut(mockTokenPrices)

      const result = await tokenService.fetchTokenPricesFromBackend(
        mockTokens,
        mockNetworkId,
      )
      expect(result).toEqual(mockTokenPrices)
    })
  })

  describe("fetch token details", () => {
    it("should return the cached version", async () => {
      const mockBaseToken = getMockBaseToken()
      const mockToken = getMockToken()
      await db.tokens.put(mockToken)

      const result = await tokenService.fetchTokenDetails(mockBaseToken)
      expect(result).toEqual(mockToken)
    })
    it("should fetch token details from onchain with multicall if cached version is not found", async () => {
      const mockBaseToken = getMockBaseToken()
      const mockToken = getMockToken()
      mockNetworkService.getById = vi
        .fn()
        .mockResolvedValueOnce(getMockNetwork())
      tokenService.fetchTokenDetailsWithMulticall = vi
        .fn()
        .mockResolvedValueOnce([
          shortString.encodeShortString(mockToken.name),
          shortString.encodeShortString(mockToken.symbol),
          mockToken.decimals,
        ])

      const result = await tokenService.fetchTokenDetails(mockBaseToken)

      expect(result).toEqual({
        ...mockToken,
        custom: true,
      })
    })
    it("should fetch token details from onchain without multicall if cached version is not found ", async () => {
      const mockBaseToken = getMockBaseToken()
      const mockToken = getMockToken()
      mockNetworkService.getById = vi
        .fn()
        .mockResolvedValueOnce(getMockNetworkWithoutMulticall())
      tokenService.fetchTokenDetailsWithoutMulticall = vi
        .fn()
        .mockResolvedValueOnce([
          shortString.encodeShortString(mockToken.name),
          shortString.encodeShortString(mockToken.symbol),
          mockToken.decimals,
        ])

      const result = await tokenService.fetchTokenDetails(mockBaseToken)

      expect(result).toEqual({
        ...mockToken,
        custom: true,
      })
    })

    it("should throw error if decimals is greater than max javascript safe integer", async () => {
      const mockBaseToken = getMockBaseToken()
      const mockToken = getMockToken()
      mockNetworkService.getById = vi
        .fn()
        .mockResolvedValueOnce(getMockNetworkWithoutMulticall())
      tokenService.fetchTokenDetailsWithoutMulticall = vi
        .fn()
        .mockResolvedValueOnce([
          shortString.encodeShortString(mockToken.name),
          shortString.encodeShortString(mockToken.symbol),
          Number.MAX_SAFE_INTEGER + 1,
        ])
      await expect(
        tokenService.fetchTokenDetails(mockBaseToken),
      ).rejects.toThrowError(
        new TokenError({
          code: "UNSAFE_DECIMALS",
          options: {
            context: { decimals: Number.MAX_SAFE_INTEGER + 1 },
          },
        }),
      )
    })

    it("should throw error if token details are not found with multicall", async () => {
      const mockBaseToken = getMockBaseToken()
      mockNetworkService.getById = vi
        .fn()
        .mockResolvedValueOnce(getMockNetwork())
      tokenService.fetchTokenDetailsWithMulticall = vi
        .fn()
        .mockRejectedValueOnce(new GatewayError("NOT_FOUND", "500"))
      await expect(
        tokenService.fetchTokenDetails(mockBaseToken),
      ).rejects.toThrowError(
        new TokenError({
          code: "TOKEN_DETAILS_NOT_FOUND",
          message: `Token details not found for token ${mockBaseToken.address}`,
        }),
      )
    })

    it("should throw error if token details are not found without multicall", async () => {
      const mockBaseToken = getMockBaseToken()
      mockNetworkService.getById = vi
        .fn()
        .mockResolvedValueOnce(getMockNetworkWithoutMulticall())
      tokenService.fetchTokenDetailsWithoutMulticall = vi
        .fn()
        .mockRejectedValueOnce(new GatewayError("NOT_FOUND", "500"))
      await expect(
        tokenService.fetchTokenDetails(mockBaseToken),
      ).rejects.toThrowError(
        new TokenError({
          code: "TOKEN_DETAILS_NOT_FOUND",
          message: `Token details not found for token ${mockBaseToken.address}`,
        }),
      )
    })
  })

  it("should get token balances for account", async () => {
    const mockAccount = { address: "0x123", networkId: "mainnet-alpha" }
    const mockTokens = [getMockToken(), getMockToken({ address: "0x456" })]
    const mockTokenBalances = mockTokens.map((token) =>
      getMockBaseTokenWithBalance({
        ...token,
        balance: "100",
        account: mockAccount.address,
        networkId: "mainnet-alpha",
      }),
    )

    await db.tokenBalances.bulkPut(mockTokenBalances)

    const result = await tokenService.getTokenBalancesForAccount(
      mockAccount,
      mockTokens,
    )
    expect(result).toEqual(mockTokenBalances)
  })

  describe("get currency value for token", () => {
    afterEach(() => {
      vi.resetAllMocks()
      vi.resetModules()
    })

    it("should get currency value for tokens", async () => {
      const mockTokens = [getMockToken(), getMockToken({ address: "0x456" })]
      const mockTokenBalances = [
        getMockBaseTokenWithBalance(),
        getMockBaseTokenWithBalance({ address: "0x456", balance: "200" }),
      ]

      const mockTokenPrices = [
        getMockTokenPriceDetails(),
        getMockTokenPriceDetails({
          address: "0x456",
          pricingId: 2,
          ethValue: "0.36",
        }),
      ]

      await db.tokenPrices.bulkPut(mockTokenPrices)
      await db.tokens.bulkPut(mockTokens)

      const result =
        await tokenService.getCurrencyValueForTokens(mockTokenBalances)
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            usdValue: expect.any(String),
          }),
        ]),
      )
    })

    it("should throw error if token price is not found", async () => {
      const mockTokens = [getMockToken(), getMockToken({ address: "0x456" })]
      const mockTokenBalances = [
        getMockBaseTokenWithBalance(),
        getMockBaseTokenWithBalance({ address: "0x456", balance: "200" }),
      ]
      const mockTokenPrices = [getMockTokenPriceDetails()]

      await db.tokenPrices.bulkPut(mockTokenPrices)
      await db.tokens.bulkPut(mockTokens)

      await expect(
        tokenService.getCurrencyValueForTokens(mockTokenBalances),
      ).rejects.toThrowError(
        new TokenError({
          code: "TOKEN_PRICE_NOT_FOUND",
          message: `Token price for 0x456 not found`,
        }),
      )
    })

    it("should throw error if token is not found", async () => {
      const mockTokens = [getMockToken()]
      const mockTokenBalances = [
        getMockBaseTokenWithBalance(),
        getMockBaseTokenWithBalance({ address: "0x456", balance: "200" }),
      ]
      const mockTokenPrices = [
        getMockTokenPriceDetails(),
        getMockTokenPriceDetails({
          address: "0x456",
          pricingId: 2,
          ethValue: "0.36",
        }),
      ]

      await db.tokenPrices.bulkPut(mockTokenPrices)
      await db.tokens.bulkPut(mockTokens)

      await expect(
        tokenService.getCurrencyValueForTokens(mockTokenBalances),
      ).rejects.toThrowError(
        new TokenError({
          code: "TOKEN_NOT_FOUND",
          message: `Token 0x456 not found`,
        }),
      )
    })

    it("should throw error if unable to calculate currency value", async () => {
      const mockTokens = [getMockToken(), getMockToken({ address: "0x456" })]
      const mockTokensWithBalances = [
        getMockBaseTokenWithBalance(),
        getMockBaseTokenWithBalance({ address: "0x456", balance: "xyz" }), // balance should be numeric
      ]
      const mockTokenPrices = [
        getMockTokenPriceDetails(),
        getMockTokenPriceDetails({
          address: "0x456",
          pricingId: 2,
          ethValue: "0.36",
        }),
      ]

      await db.tokenPrices.bulkPut(mockTokenPrices)
      await db.tokens.bulkPut(mockTokens)

      await expect(
        tokenService.getCurrencyValueForTokens(mockTokensWithBalances),
      ).rejects.toThrowError(
        new TokenError({
          code: "UNABLE_TO_CALCULATE_CURRENCY_VALUE",
          message: `Unable to calculate currency value for token 0x456`,
        }),
      )
    })
  })

  describe("get total currency balance for account", () => {
    it("should get total currency balance for different accounts", async () => {
      const mockAccounts = [
        { address: randomAddress1, networkId: defaultNetwork.id },
        { address: randomAddress2, networkId: defaultNetwork.id },
      ]

      const mockBaseTokens = [
        getMockBaseToken({ networkId: defaultNetwork.id }),
        getMockBaseToken({ address: "0x456", networkId: defaultNetwork.id }),
      ]
      const mockTokens = [
        getMockToken({ networkId: defaultNetwork.id }),
        getMockToken({ address: "0x456", networkId: defaultNetwork.id }),
      ]

      const mockTokensWithBalances = [
        getMockBaseTokenWithBalance({
          ...mockBaseTokens[0],
          balance: BigInt(10e17).toString(),
          account: mockAccounts[0].address,
        }),
        getMockBaseTokenWithBalance({
          ...mockBaseTokens[1],
          balance: BigInt(10e16).toString(),
          account: mockAccounts[1].address,
        }),
      ]
      const mockTokenPrices = [
        getMockTokenPriceDetails({ ...mockBaseTokens[0], pricingId: 1 }),
        getMockTokenPriceDetails({
          ...mockBaseTokens[1],
          pricingId: 2,
          ethValue: "0.36",
        }),
      ]

      await db.tokenBalances.bulkPut(mockTokensWithBalances)
      await db.tokenPrices.bulkPut(mockTokenPrices)
      await db.tokens.bulkPut(mockTokens)

      const result = await tokenService.getTotalCurrencyBalanceForAccounts(
        mockAccounts.map((acc) => {
          return {
            address: stripAddressZeroPadding(acc.address),
            networkId: acc.networkId,
          }
        }),
      )
      expect(result).toEqual({
        [`${stripAddressZeroPadding(randomAddress1)}:${defaultNetwork.id}`]:
          "2000",
        [`${stripAddressZeroPadding(randomAddress2)}:${defaultNetwork.id}`]:
          "200",
      })
    })
  })

  it("should get total currency balance for account", async () => {
    const mockAccount = {
      address: stripAddressZeroPadding(randomAddress1),
      networkId: defaultNetwork.id,
    }
    const mockBaseTokens = [
      getMockBaseToken({ networkId: defaultNetwork.id }),
      getMockBaseToken({ address: "0x456", networkId: defaultNetwork.id }),
      getMockBaseToken({ address: "0x789", networkId: defaultNetwork.id }),
    ]
    const mockTokens = [
      getMockToken({ networkId: defaultNetwork.id }),
      getMockToken({ address: "0x456", networkId: defaultNetwork.id }),
      getMockToken({ address: "0x789", networkId: defaultNetwork.id }),
    ]

    const mockTokensWithBalances = [
      getMockBaseTokenWithBalance({
        ...mockBaseTokens[0],
        balance: BigInt(10e17).toString(),
        account: mockAccount.address,
      }),
      getMockBaseTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(10e16).toString(),
        account: mockAccount.address,
      }),
      getMockBaseTokenWithBalance({
        ...mockBaseTokens[2],
        balance: BigInt(0).toString(),
        account: mockAccount.address,
      }),
    ]
    const mockTokenPrices = [
      getMockTokenPriceDetails({ ...mockBaseTokens[0], pricingId: 1 }),
      getMockTokenPriceDetails({
        ...mockBaseTokens[1],
        pricingId: 2,
        ethValue: "0.36",
      }),
      getMockTokenPriceDetails({
        ...mockBaseTokens[2],
        pricingId: 3,
        ethValue: "10",
      }),
    ]

    await db.tokenBalances.bulkPut(mockTokensWithBalances)
    await db.tokenPrices.bulkPut(mockTokenPrices)
    await db.tokens.bulkPut(mockTokens)

    const result = await tokenService.getTotalCurrencyBalanceForAccounts([
      mockAccount,
    ])
    expect(result).toEqual({
      [`${mockAccount.address}:${mockAccount.networkId}`]: "2200",
    })
  })
})
