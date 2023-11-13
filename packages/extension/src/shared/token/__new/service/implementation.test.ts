import { Mocked } from "vitest"
import { NetworkService } from "../../../network/service/implementation"
import { INetworkService } from "../../../network/service/interface"
import { MockFnRepository } from "../../../storage/__new/__test__/mockFunctionImplementation"
import { ITokenRepository } from "../repository/token"
import { ITokenBalanceRepository } from "../repository/tokenBalance"
import { ITokenPriceRepository } from "../repository/tokenPrice"
import { TokenService } from "./implementation"
import {
  getMockApiTokenDetails,
  getMockBaseToken,
  getMockToken,
  getMockTokenPriceDetails,
  getMockTokenWithBalance,
} from "../../../../../test/token.mock"
import { defaultNetwork } from "../../../network"
import {
  getMockNetwork,
  getMockNetworkWithoutMulticall,
} from "../../../../../test/network.mock"
import { INetworkRepo } from "../../../network/store"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { GatewayError, shortString, stark } from "starknet"
import { addressSchema } from "@argent/shared"
import { TokenError } from "../../../errors/token"

const BASE_INFO_ENDPOINT = "https://token.info.argent47.net/v1"
const BASE_INFO_ENDPOINT_INVALID = "https://token.info.argent47.net/v2"
const BASE_PRICES_ENDPOINT = "https://token.prices.argent47.net/v1"

// const BASE_URL_WITH_WILDCARD = BASE_URL_ENDPOINT + "*"

const randomAddress1 = addressSchema.parse(stark.randomAddress())
const randomAddress2 = addressSchema.parse(stark.randomAddress())

/**
 * @vitest-environment jsdom
 */
const server = setupServer(
  rest.get(BASE_INFO_ENDPOINT, (req, res, ctx) => {
    return res(
      ctx.json({
        tokens: [
          getMockApiTokenDetails({ id: 1, address: randomAddress1 }),
          getMockApiTokenDetails({
            id: 2,
            address: randomAddress2,
            pricingId: 2,
          }),
        ],
      }),
    )
  }),
  rest.get(BASE_INFO_ENDPOINT_INVALID, (req, res, ctx) => {
    return res(
      ctx.json([
        getMockApiTokenDetails({ address: randomAddress1 }),
        getMockApiTokenDetails({ address: randomAddress2, pricingId: 2 }),
      ]),
    )
  }),
  rest.get(BASE_PRICES_ENDPOINT, (req, res, ctx) => {
    return res(
      ctx.json({
        prices: [
          getMockTokenPriceDetails({ pricingId: 1, ethValue: "0.32" }),
          getMockTokenPriceDetails({ pricingId: 2, ethValue: "0.64" }),
        ],
      }),
    )
  }),
)

describe("TokenService", () => {
  let tokenService: TokenService
  let mockNetworkService: Mocked<INetworkService>
  let mockNetworkRepo: MockFnRepository<INetworkRepo>
  let mockTokenRepo: MockFnRepository<ITokenRepository>
  let mockTokenBalanceRepo: MockFnRepository<ITokenBalanceRepository>
  let mockTokenPriceRepo: MockFnRepository<ITokenPriceRepository>
  beforeAll(() => {
    server.listen()
  })
  beforeEach(() => {
    mockTokenRepo = new MockFnRepository()
    mockTokenBalanceRepo = new MockFnRepository()
    mockTokenPriceRepo = new MockFnRepository()
    mockNetworkRepo = new MockFnRepository()

    mockNetworkService = vi.mocked<INetworkService>(
      new NetworkService(mockNetworkRepo),
    )

    tokenService = new TokenService(
      mockNetworkService,
      mockTokenRepo,
      mockTokenBalanceRepo,
      mockTokenPriceRepo,
      BASE_INFO_ENDPOINT,
      BASE_PRICES_ENDPOINT,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should add a token", async () => {
    const mockToken = getMockToken()
    await tokenService.addToken(mockToken)
    expect(mockTokenRepo.upsert).toHaveBeenCalledWith(mockToken)
  })

  it("should remove a token", async () => {
    const mockBaseToken = getMockBaseToken()
    const mockToken = getMockToken()
    mockTokenRepo.get.mockResolvedValueOnce([mockToken])
    await tokenService.removeToken(mockBaseToken)
    expect(mockTokenRepo.remove).toHaveBeenCalledWith(mockToken)
  })

  it("should update tokens", async () => {
    const mockTokens = [
      getMockToken(),
      getMockToken({ address: "0x456" }),
      getMockToken({ networkId: "goerli-alpha" }),
    ]
    await tokenService.updateTokens(mockTokens)
    expect(mockTokenRepo.upsert).toHaveBeenCalledWith(mockTokens)
  })

  it("should update token balances", async () => {
    const mockTokensWithBalance = [
      getMockTokenWithBalance(),
      getMockTokenWithBalance({ address: "0x456", balance: "200" }),
    ]
    await tokenService.updateTokenBalances(mockTokensWithBalance)
    expect(mockTokenBalanceRepo.upsert).toHaveBeenCalledWith(
      mockTokensWithBalance,
    )
  })

  it("should update token prices", async () => {
    const mockTokenPrices = [
      getMockTokenPriceDetails(),
      getMockTokenPriceDetails({ pricingId: 2, ethValue: "0.36" }),
    ]
    await tokenService.updateTokenPrices(mockTokenPrices)
    expect(mockTokenPriceRepo.upsert).toHaveBeenCalledWith(mockTokenPrices)
  })

  describe("fetch tokens from backend", () => {
    it("should fetch tokens from backend", async () => {
      const mockNetworkId = defaultNetwork.id
      const defaultMockApiTokeDetails = getMockApiTokenDetails()
      const mockToken1 = getMockToken({
        id: 1,
        address: randomAddress1,
        networkId: mockNetworkId,
        iconUrl: defaultMockApiTokeDetails.iconUrl,
        showAlways: undefined,
        custom: undefined,
        popular: defaultMockApiTokeDetails.popular,
        pricingId: defaultMockApiTokeDetails.pricingId,
      })
      const mockToken2 = getMockToken({
        id: 2,
        address: randomAddress2,
        networkId: mockNetworkId,
        showAlways: undefined,
        iconUrl: defaultMockApiTokeDetails.iconUrl,
        custom: undefined,
        popular: defaultMockApiTokeDetails.popular,
        pricingId: 2,
      })
      const mockTokens = [mockToken1, mockToken2]
      mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
      const result = await tokenService.fetchTokensFromBackend(mockNetworkId)
      expect(result).toEqual(mockTokens)
    })

    it("should return without fetching tokens if it is not a default network", async () => {
      const mockNetworkId = "mockNetworkId"
      const mockTokens = [getMockToken({ networkId: mockNetworkId })]
      mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
      const result = await tokenService.fetchTokensFromBackend(mockNetworkId)
      expect(result).toEqual(mockTokens)
    })

    it("should throw parsing error if token info response is not valid", async () => {
      const invalidTokenService = new TokenService(
        mockNetworkService,
        mockTokenRepo,
        mockTokenBalanceRepo,
        mockTokenPriceRepo,
        BASE_INFO_ENDPOINT_INVALID,
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
      mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
      await expect(
        invalidTokenService.fetchTokensFromBackend(mockNetworkId),
      ).rejects.toThrowError(new TokenError({ code: "TOKEN_PARSING_ERROR" }))
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
      mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
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

      const result = await tokenService.fetchTokenBalancesFromOnChain(
        mockAccount,
      )
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
      mockTokenRepo.get.mockResolvedValueOnce(mockTokens)
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

      const result = await tokenService.fetchTokenBalancesFromOnChain(
        mockAccounts,
      )
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
      mockTokenPriceRepo.get.mockResolvedValueOnce([])
      const result = await tokenService.fetchTokenPricesFromBackend(
        mockTokens,
        defaultNetwork.id,
      )
      expect(result).toEqual(mockTokenPrices)
    })

    it("should return token prices without fetching on a different network", async () => {
      const mockNetworkId = "goerli-alpha"
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
      mockTokenPriceRepo.get.mockResolvedValueOnce(mockTokenPrices)
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
      mockTokenRepo.get.mockResolvedValueOnce([mockToken])
      const result = await tokenService.fetchTokenDetails(mockBaseToken)
      expect(result).toEqual(mockToken)
    })
    it("should fetch token details from onchain with multicall if cached version is not found", async () => {
      const mockBaseToken = getMockBaseToken()
      const mockToken = getMockToken()
      mockTokenRepo.get.mockResolvedValueOnce([])
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
      mockTokenRepo.get.mockResolvedValueOnce([])
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
      mockTokenRepo.get.mockResolvedValueOnce([])
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
      mockTokenRepo.get.mockResolvedValueOnce([])
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
      mockTokenRepo.get.mockResolvedValueOnce([])
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
    const mockAccount = { address: "0x123", networkId: "mockNetworkId" }
    const mockTokens = [getMockToken(), getMockToken({ address: "0x456" })]
    const mockTokenBalances = mockTokens.map((token) =>
      getMockTokenWithBalance({ ...token, balance: "100" }),
    )
    mockTokenBalanceRepo.get.mockResolvedValueOnce(mockTokenBalances)
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
      const mockTokensWithBalances = [
        getMockTokenWithBalance(),
        getMockTokenWithBalance({ address: "0x456", balance: "200" }),
      ]
      const mockTokenPrices = [
        getMockTokenPriceDetails(),
        getMockTokenPriceDetails({
          address: "0x456",
          pricingId: 2,
          ethValue: "0.36",
        }),
      ]
      mockTokenPriceRepo.get.mockResolvedValueOnce(mockTokenPrices)
      mockTokenRepo.get.mockResolvedValueOnce(mockTokensWithBalances)
      const result = await tokenService.getCurrencyValueForTokens(
        mockTokensWithBalances,
      )
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            usdValue: expect.any(String),
          }),
        ]),
      )
    })

    it("should throw error if token price is not found", async () => {
      const mockTokensWithBalances = [
        getMockTokenWithBalance(),
        getMockTokenWithBalance({ address: "0x456", balance: "200" }),
      ]
      const mockTokenPrices = [getMockTokenPriceDetails()]
      mockTokenPriceRepo.get.mockResolvedValueOnce(mockTokenPrices)
      mockTokenRepo.get.mockResolvedValueOnce(mockTokensWithBalances)
      await expect(
        tokenService.getCurrencyValueForTokens(mockTokensWithBalances),
      ).rejects.toThrowError(
        new TokenError({
          code: "TOKEN_PRICE_NOT_FOUND",
          message: `Token price for 0x456 not found`,
        }),
      )
    })

    it("should throw error if token is not found", async () => {
      const mockTokensWithBalances = [
        getMockTokenWithBalance(),
        getMockTokenWithBalance({ address: "0x456", balance: "200" }),
      ]
      const mockTokenPrices = [
        getMockTokenPriceDetails(),
        getMockTokenPriceDetails({
          address: "0x456",
          pricingId: 2,
          ethValue: "0.36",
        }),
      ]
      mockTokenPriceRepo.get.mockResolvedValueOnce(mockTokenPrices)
      mockTokenRepo.get.mockResolvedValueOnce([mockTokensWithBalances[0]])
      await expect(
        tokenService.getCurrencyValueForTokens(mockTokensWithBalances),
      ).rejects.toThrowError(
        new TokenError({
          code: "TOKEN_NOT_FOUND",
          message: `Token 0x456 not found`,
        }),
      )
    })

    it("should throw error if unable to calculate currency value", async () => {
      const mockTokensWithBalances = [
        getMockTokenWithBalance(),
        getMockTokenWithBalance({ address: "0x456", balance: "xyz" }), // balance should be numeric
      ]
      const mockTokenPrices = [
        getMockTokenPriceDetails(),
        getMockTokenPriceDetails({
          address: "0x456",
          pricingId: 2,
          ethValue: "0.36",
        }),
      ]
      mockTokenPriceRepo.get.mockResolvedValueOnce(mockTokenPrices)
      mockTokenRepo.get.mockResolvedValueOnce(mockTokensWithBalances)

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

      const mockTokensWithBalances = [
        getMockTokenWithBalance({
          ...mockBaseTokens[0],
          balance: BigInt(10e17).toString(),
          account: mockAccounts[0],
        }),
        getMockTokenWithBalance({
          ...mockBaseTokens[1],
          balance: BigInt(10e16).toString(),
          account: mockAccounts[1],
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
      mockTokenBalanceRepo.get.mockResolvedValueOnce(mockTokensWithBalances)
      mockTokenPriceRepo.get.mockResolvedValueOnce(mockTokenPrices)
      mockTokenRepo.get.mockResolvedValueOnce(mockTokensWithBalances)
      const result = await tokenService.getTotalCurrencyBalanceForAccounts(
        mockAccounts,
      )
      expect(result).toEqual({
        [`${randomAddress1}:${defaultNetwork.id}`]: "2000",
        [`${randomAddress2}:${defaultNetwork.id}`]: "200",
      })
    })
  })

  it("should get total currency balance for account", async () => {
    const mockAccount = {
      address: randomAddress1,
      networkId: defaultNetwork.id,
    }
    const mockBaseTokens = [
      getMockBaseToken({ networkId: defaultNetwork.id }),
      getMockBaseToken({ address: "0x456", networkId: defaultNetwork.id }),
      getMockBaseToken({ address: "0x789", networkId: defaultNetwork.id }),
    ]

    const mockTokensWithBalances = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        balance: BigInt(10e17).toString(),
        account: mockAccount,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(10e16).toString(),
        account: mockAccount,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[2],
        balance: BigInt(0).toString(),
        account: mockAccount,
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
    mockTokenBalanceRepo.get.mockResolvedValueOnce(mockTokensWithBalances)
    mockTokenPriceRepo.get.mockResolvedValueOnce(mockTokenPrices)
    mockTokenRepo.get.mockResolvedValueOnce(mockTokensWithBalances)
    const result = await tokenService.getTotalCurrencyBalanceForAccounts([
      mockAccount,
    ])
    expect(result).toEqual({
      [`${mockAccount.address}:${mockAccount.networkId}`]: "2200",
    })
  })
})
