import { addressSchema } from "@argent/x-shared"
import { stark } from "starknet6"
import {
  getMockBaseToken,
  getMockTokenPriceDetails,
  getMockTokenWithBalance,
} from "../../../../../test/token.mock"
import { TokenError } from "../../../../shared/errors/token"
import { defaultNetwork } from "../../../../shared/network"
import { parsedDefaultTokens } from "../../../../shared/token/__new/utils"
import {
  addCurrencyValueToTokensList,
  sortTokensWithPrices,
} from "../../tokenPrices"

const randomAddress1 = addressSchema.parse(stark.randomAddress())

describe("sortedTokensWithBalances", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const mockAccount = {
    address: randomAddress1,
    networkId: defaultNetwork.id,
    network: defaultNetwork,
  }

  const mockBaseTokens = [
    getMockBaseToken({ networkId: defaultNetwork.id }),
    getMockBaseToken({ address: "0x456", networkId: defaultNetwork.id }),
    getMockBaseToken({ address: "0x234", networkId: defaultNetwork.id }),
  ]

  describe("should verify add currency value to token list", () => {
    it("should add currency value to token list", () => {
      const mockTokensWithBalances = [
        getMockTokenWithBalance({
          ...mockBaseTokens[0],
          balance: BigInt(10e17).toString(),
          account: mockAccount,
        }),
        getMockTokenWithBalance({
          ...mockBaseTokens[1],
          balance: BigInt(20e16).toString(),
          account: mockAccount,
        }),
      ]

      const mockTokenPrices = [
        getMockTokenPriceDetails({
          ...mockBaseTokens[0],
          ccyValue: "2534.515044",
        }),
        getMockTokenPriceDetails({
          ...mockBaseTokens[1],
          ccyValue: "1.00019",
        }),
      ]

      const tokensWithCurrencyValue = addCurrencyValueToTokensList(
        mockTokensWithBalances,
        mockTokenPrices,
        mockTokensWithBalances,
      )

      expect(tokensWithCurrencyValue[0].usdValue).toEqual("2534.515044")
      expect(tokensWithCurrencyValue[1].usdValue).toEqual("0.200038")
    })

    it("should add 0.00 currency value when price cannot be computed", () => {
      const mockTokensWithBalances = [
        getMockTokenWithBalance({
          ...mockBaseTokens[0],
          balance: BigInt(10e17).toString(),
          account: mockAccount,
        }),
        getMockTokenWithBalance({
          ...mockBaseTokens[1],
          balance: BigInt(20e16).toString(),
          account: mockAccount,
        }),
      ]

      const mockTokenPrices = [
        getMockTokenPriceDetails({
          ...mockBaseTokens[0],
          ccyValue: "2534.515044",
        }),
      ]

      const tokensWithCurrencyValue = addCurrencyValueToTokensList(
        mockTokensWithBalances,
        mockTokenPrices,
        mockTokensWithBalances,
      )

      expect(tokensWithCurrencyValue[0].usdValue).toEqual("2534.515044")
      expect(tokensWithCurrencyValue[1].usdValue).toEqual("0.00")
    })

    it("should throw error if token not found", async () => {
      const mockTokensWithBalances = [
        getMockTokenWithBalance({
          ...mockBaseTokens[0],
          balance: BigInt(10e17).toString(),
          account: mockAccount,
        }),
        getMockTokenWithBalance({
          ...mockBaseTokens[1],
          balance: BigInt(20e16).toString(),
          account: mockAccount,
        }),
      ]

      const mockTokenPrices = [
        getMockTokenPriceDetails({
          ...mockBaseTokens[0],
          ccyValue: "2534.515044",
        }),
        getMockTokenPriceDetails({
          ...mockBaseTokens[0],
          ccyValue: "1.00019",
        }),
      ]

      const mockTokens = [
        getMockTokenWithBalance({
          ...mockBaseTokens[0],
          account: mockAccount,
        }),
      ]

      try {
        addCurrencyValueToTokensList(
          mockTokensWithBalances,
          mockTokenPrices,
          mockTokens,
        )
      } catch (error) {
        expect(error).toBeInstanceOf(TokenError)
        expect((error as TokenError).code).toEqual("TOKEN_NOT_FOUND")
        expect((error as TokenError).message).toEqual(`Token 0x456 not found`)
      }
    })
  })

  describe("should verify token list sorting", () => {
    it("should sort token list with default tokens first", () => {
      const defaultTokens = parsedDefaultTokens.filter(
        (t) => t.networkId === defaultNetwork.id,
      )
      const mockDefaultTokensWithBalances = defaultTokens.map((t) => {
        return {
          ...t,
          balance: BigInt(10e17).toString(),
          account: mockAccount,
        }
      })

      const mockOtherTokensWithBalances = [
        getMockTokenWithBalance({
          ...mockBaseTokens[0],
          balance: BigInt(10e17).toString(),
          account: mockAccount,
        }),
        getMockTokenWithBalance({
          ...mockBaseTokens[1],
          balance: BigInt(20e16).toString(),
          account: mockAccount,
        }),
      ]

      const allTokensWithBalace = [
        ...mockOtherTokensWithBalances,
        ...mockDefaultTokensWithBalances,
      ]

      const mockTokenPrices = [
        getMockTokenPriceDetails({
          ...mockBaseTokens[0],
          ccyValue: "2534.515044",
        }),
        getMockTokenPriceDetails({
          ...mockBaseTokens[0],
          ccyValue: "1.00019",
        }),
        ...defaultTokens.map((t) =>
          getMockTokenPriceDetails({
            ...t,
            ccyValue: "34.4309",
          }),
        ),
      ]

      const tokensWithCurrencyValue = addCurrencyValueToTokensList(
        allTokensWithBalace,
        mockTokenPrices,
        allTokensWithBalace,
      )

      const sortedTokens = sortTokensWithPrices(tokensWithCurrencyValue)

      const defaultTokensNo = defaultTokens.length
      const defaultTokensAddresses = defaultTokens.map((t) => t.address)
      for (let i = 0; i < defaultTokensNo; i++) {
        expect(defaultTokensAddresses).toContain(sortedTokens[i].address)
      }
    })

    it("should sort other tokens by currency value", () => {
      const mockOtherTokensWithBalances = [
        getMockTokenWithBalance({
          ...mockBaseTokens[0],
          balance: BigInt(10e17).toString(),
          account: mockAccount,
        }),
        getMockTokenWithBalance({
          ...mockBaseTokens[1],
          balance: BigInt(20e16).toString(),
          account: mockAccount,
        }),
        getMockTokenWithBalance({
          ...mockBaseTokens[2],
          balance: BigInt(10e16).toString(),
          account: mockAccount,
        }),
      ]

      const mockTokenPrices = [
        getMockTokenPriceDetails({
          ...mockBaseTokens[0],
          ccyValue: "2534.515044",
        }),
        getMockTokenPriceDetails({
          ...mockBaseTokens[1],
          ccyValue: "1.00019",
        }),
        getMockTokenPriceDetails({
          ...mockBaseTokens[2],
          ccyValue: "34.4309",
        }),
      ]

      const tokensWithCurrencyValue = addCurrencyValueToTokensList(
        mockOtherTokensWithBalances,
        mockTokenPrices,
        mockOtherTokensWithBalances,
      )

      const sortedTokens = sortTokensWithPrices(tokensWithCurrencyValue)

      expect(sortedTokens[0].address).toEqual(mockBaseTokens[0].address)
      expect(sortedTokens[1].address).toEqual(mockBaseTokens[2].address)
      expect(sortedTokens[2].address).toEqual(mockBaseTokens[1].address)
    })
  })

  it("should sort token list by default tokens first and then other tokens by currency value", () => {
    const defaultTokens = parsedDefaultTokens.filter(
      (t) => t.networkId === defaultNetwork.id,
    )
    const mockDefaultTokensWithBalances = defaultTokens.map((t) => {
      return {
        ...t,
        balance: BigInt(10e17).toString(),
        account: mockAccount,
      }
    })

    const mockOtherTokensWithBalances = [
      getMockTokenWithBalance({
        ...mockBaseTokens[0],
        balance: BigInt(10e17).toString(),
        account: mockAccount,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[1],
        balance: BigInt(20e16).toString(),
        account: mockAccount,
      }),
      getMockTokenWithBalance({
        ...mockBaseTokens[2],
        balance: BigInt(10e16).toString(),
        account: mockAccount,
      }),
    ]

    const allTokensWithBalace = [
      ...mockOtherTokensWithBalances,
      ...mockDefaultTokensWithBalances,
    ]

    const mockTokenPrices = [
      getMockTokenPriceDetails({
        ...mockBaseTokens[0],
        ccyValue: "2534.515044",
      }),
      getMockTokenPriceDetails({
        ...mockBaseTokens[1],
        ccyValue: "1.00019",
      }),
      getMockTokenPriceDetails({
        ...mockBaseTokens[2],
        ccyValue: "34.4309",
      }),
      ...defaultTokens.map((t) =>
        getMockTokenPriceDetails({
          ...t,
          ccyValue: "34.4309",
        }),
      ),
    ]

    const tokensWithCurrencyValue = addCurrencyValueToTokensList(
      allTokensWithBalace,
      mockTokenPrices,
      allTokensWithBalace,
    )

    const sortedTokens = sortTokensWithPrices(tokensWithCurrencyValue)

    const defaultTokensNo = defaultTokens.length
    const defaultTokensAddresses = defaultTokens.map((t) => t.address)

    for (let i = 0; i < defaultTokensNo; i++) {
      expect(defaultTokensAddresses).toContain(sortedTokens[i].address)
    }
    expect(sortedTokens[defaultTokensNo].address).toEqual(
      mockBaseTokens[0].address,
    )
    expect(sortedTokens[defaultTokensNo + 1].address).toEqual(
      mockBaseTokens[2].address,
    )
    expect(sortedTokens[defaultTokensNo + 2].address).toEqual(
      mockBaseTokens[1].address,
    )
  })
})
