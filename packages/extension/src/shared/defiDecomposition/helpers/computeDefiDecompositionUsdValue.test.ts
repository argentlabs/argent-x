import { getMockAccount } from "../../../../test/account.mock"
import { defiDecomposition } from "../__fixtures__/defiDecomposition"
import { tokenPrices } from "../__fixtures__/tokenPrices"
import { tokens } from "../__fixtures__/tokens"
import type {
  ParsedCollateralizedDebtBorrowingPositionWithUsdValue,
  ParsedCollateralizedDebtPositionWithUsdValue,
  ParsedDefiDecomposition,
  ParsedDelegatedTokensPositionWithUsdValue,
  ParsedStakingPositionWithUsdValue,
} from "../schema"
import {
  parsedCollateralizedDebtPositionWithUsdValueSchema,
  parsedDelegatedTokensPositionWithUsdValueSchema,
} from "../schema"
import { computeDefiDecompositionUsdValue } from "./computeDefiDecompositionUsdValue"
import { parseDefiDecomposition } from "./parseDefiDecomposition"

describe("computeDefiDecompositionUsdValue", () => {
  const mockAccount = getMockAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })
  let parsedDefiDecomposition: ParsedDefiDecomposition

  beforeEach(() => {
    parsedDefiDecomposition = parseDefiDecomposition(
      defiDecomposition,
      mockAccount,
      tokens,
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should compute USD value for the entire defi decomposition and sort by balance", async () => {
    const result = computeDefiDecompositionUsdValue(
      parsedDefiDecomposition,
      tokens,
      tokenPrices,
    )

    expect(result).toBeDefined()
    expect(result).toHaveLength(parsedDefiDecomposition.length)

    // Check Vesu (collateralizedDebtPosition)
    const vesuDapp = result[0]
    expect(vesuDapp.products).toHaveLength(2)
    const vesuLendingProduct = vesuDapp.products[1]
    expect(vesuLendingProduct.positions).toHaveLength(2)
    const vesuBorrowingProduct = vesuDapp.products[0]
    expect(vesuBorrowingProduct.positions).toHaveLength(3)
    expect(vesuDapp.totalUsdValue).toEqual(
      "35151822.148192485162538308119350079",
    )
    vesuLendingProduct.positions.forEach((position, index) => {
      expect(
        parsedCollateralizedDebtPositionWithUsdValueSchema.safeParse(position)
          .success,
      ).toBe(true)

      if (index === 1) {
        const collateralizedDebtPosition =
          position as ParsedCollateralizedDebtPositionWithUsdValue
        expect(collateralizedDebtPosition.token.usdValue).toEqual(
          "7998.868427433808806882",
        )
      } else if (index === 0) {
        const collateralizedDebtPosition =
          position as ParsedCollateralizedDebtPositionWithUsdValue
        expect(collateralizedDebtPosition.token.usdValue).toEqual(
          "1252645.40737625120985132",
        )
      }
    })
    vesuBorrowingProduct.positions.forEach((position, index) => {
      if (index === 0) {
        const collateralizedDebtPosition =
          position as ParsedCollateralizedDebtBorrowingPositionWithUsdValue
        expect(
          collateralizedDebtPosition.collateralizedPositions[0].token.usdValue,
        ).toBeDefined()
        expect(
          collateralizedDebtPosition.debtPositions[0].token.usdValue,
        ).toBeDefined()
        expect(
          collateralizedDebtPosition.collateralizedPositions[0].token.usdValue,
        ).toEqual("20870000.0012132577431737975")
        expect(
          collateralizedDebtPosition.debtPositions[0].token.usdValue,
        ).toEqual("14631.04353477817251354")
      }
    })

    // Check Avnu (staking)
    const avnuDapp = result[1]
    expect(avnuDapp.products).toHaveLength(1)
    const avnuProduct = avnuDapp.products[0]
    expect(avnuDapp.totalUsdValue).toEqual("46.1688389077225386274691")
    const avnuPosition = avnuProduct
      .positions[0] as ParsedStakingPositionWithUsdValue
    expect(avnuProduct.positions).toHaveLength(1)
    expect(avnuPosition.token.usdValue).toBeDefined()
    expect(avnuPosition.token.usdValue).not.toBe("0")
    expect(avnuPosition.token.usdValue).toEqual("46.1688389077225386274691")

    // Check Ekubo (delegatedTokens)
    const ekuboDapp = result[2]
    expect(ekuboDapp.products).toHaveLength(1)
    const ekuboProduct = ekuboDapp.products[0]
    expect(ekuboProduct.positions).toHaveLength(2)
    ekuboProduct.positions.forEach((position, index) => {
      expect(
        parsedDelegatedTokensPositionWithUsdValueSchema.safeParse(position)
          .success,
      ).toBe(true)
      const delegatedTokensPosition =
        position as ParsedDelegatedTokensPositionWithUsdValue
      if (index === 0) {
        expect(delegatedTokensPosition.token.usdValue).toEqual(
          "1.050005476669488196418579885",
        )
      } else if (index === 1) {
        expect(delegatedTokensPosition.token.usdValue).toEqual(
          "0.058365966678547907384014494",
        )
      }
    })

    expect(ekuboDapp.totalUsdValue).toEqual("1.108371443348036103802594379")
  })
})
