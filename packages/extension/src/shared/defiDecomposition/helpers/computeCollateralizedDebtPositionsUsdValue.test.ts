import { bigDecimal } from "@argent/x-shared"
import { getMockAccount } from "../../../../test/account.mock"
import { collateralizedDebtPositions } from "../__fixtures__/collateralizedDebtPositions"
import { tokenPrices } from "../__fixtures__/tokenPrices"
import { tokens } from "../__fixtures__/tokens"
import type {
  ParsedCollateralizedDebtBorrowingPosition,
  ParsedCollateralizedDebtBorrowingPositionWithUsdValue,
  ParsedCollateralizedDebtLendingPosition,
} from "../schema"
import {
  computeCollateralizedDebtBorrowingPositionUsdValue,
  computeCollateralizedDebtBorrowingPositionsUsdValue,
  computeCollateralizedDebtLendingPositionUsdValue,
} from "./computeCollateralizedDebtPositionsUsdValue"
import { parseCollateralizedDebtPositions } from "./parseCollateralizedDebtPositions"

describe("computeCollateralizedDebtPositionsUsdValue", () => {
  const mockAccount = getMockAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  let lendingPositions: ParsedCollateralizedDebtLendingPosition[]
  let borrowingPositions: ParsedCollateralizedDebtBorrowingPosition[]

  beforeEach(async () => {
    const parsed = parseCollateralizedDebtPositions(
      collateralizedDebtPositions,
      mockAccount,
    )

    lendingPositions = parsed.lending
    borrowingPositions = parsed.borrowing
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  describe("computeCollateralizedDebtPositionUsdValue", () => {
    it("should compute USD value for a collateralized debt lending position", async () => {
      const result = computeCollateralizedDebtLendingPositionUsdValue(
        lendingPositions[0],
        tokens,
        tokenPrices,
      )
      expect(result).toBeDefined()
      expect(result?.token.usdValue).toBeDefined()
      expect(result?.token.usdValue).not.toBe("0")
      expect(result?.token.usdValue).toEqual("7998.863360153932856954")
    })
  })

  describe("computeCollateralizedDebtBorrowingPositionUsdValue", () => {
    it("should compute USD value for a collateralized debt borrowing position", async () => {
      const result = computeCollateralizedDebtBorrowingPositionUsdValue(
        borrowingPositions[0],
        tokens,
        tokenPrices,
      )

      expect(result).toBeDefined()
      expect(result?.totalUsdValue).toBeDefined()
      expect(result?.totalUsdValue).not.toBe("0")
      const collateralizedTotal = bigDecimal.parseUnits(
        result?.collateralizedPositionsTotalUsdValue || "0",
      )
      const debtTotal = bigDecimal.parseUnits(
        result?.debtPositionsTotalUsdValue || "0",
      )
      const total = bigDecimal.formatUnits(
        bigDecimal.sub(collateralizedTotal, debtTotal),
      )
      expect(total).toEqual(result?.totalUsdValue)
      expect(result?.collateralizedPositions[0].token.usdValue).toBeDefined()
      expect(result?.debtPositions[0].token.usdValue).toBeDefined()
      expect(result?.collateralizedPositions[0].token.usdValue).toEqual(
        "20870000.00002119501412663875",
      )
      expect(result?.debtPositions[0].token.usdValue).toEqual(
        "14630.99895528632098248",
      )
    })
  })

  describe("computeCollateralizedDebtBorrowingPositionsUsdValue", () => {
    it("should compute USD value for all collateralized debt borrowing positions", async () => {
      const result = computeCollateralizedDebtBorrowingPositionsUsdValue(
        borrowingPositions,
        tokens,
        tokenPrices,
      )

      expect(result).toBeDefined()
      expect(result.totalUsdValue).toBeDefined()
      expect(result.totalUsdValue).not.toBe("0")
      expect(result.totalUsdValue).toEqual(
        "33891190.830367053823960818137282085",
      )

      const firstGroupPosition = result
        .positions[0] as ParsedCollateralizedDebtBorrowingPositionWithUsdValue
      expect(
        firstGroupPosition.collateralizedPositions[0].token.usdValue,
      ).toBeDefined()
      expect(firstGroupPosition.debtPositions[0].token.usdValue).toBeDefined()
      expect(
        firstGroupPosition.collateralizedPositions[0].token.usdValue,
      ).toEqual("20870000.00002119501412663875")
      expect(firstGroupPosition.debtPositions[0].token.usdValue).toEqual(
        "14630.99895528632098248",
      )
    })
  })
})
