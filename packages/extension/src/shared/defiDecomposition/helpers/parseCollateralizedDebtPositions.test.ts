import { getMockWalletAccount } from "../../../../test/walletAccount.mock"
import { collateralizedDebtPositions } from "../__fixtures__/collateralizedDebtPositions"
import { concentratedLiquidityPositions } from "../__fixtures__/concentratedLiquidityPositions"
import {
  isCollateralizedDebtLendingPosition,
  isCollateralizedDebtBorrowingPosition,
} from "../schema"
import { parseCollateralizedDebtPositions } from "./parseCollateralizedDebtPositions"

describe("parseCollateralizedDebtPositions", () => {
  const mockAccount = getMockWalletAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  it("should parse collateralized debt positions", async () => {
    const result = parseCollateralizedDebtPositions(
      collateralizedDebtPositions,
      mockAccount,
    )

    expect(result).toBeDefined()
    expect(result.lending).toHaveLength(2) // Adjusted to check lending group
    expect(result.borrowing).toHaveLength(3) // Adjusted to check borrowing group

    expect(isCollateralizedDebtLendingPosition(result.lending[0])).toBe(true)
    expect(isCollateralizedDebtLendingPosition(result.lending[1])).toBe(true)
    expect(isCollateralizedDebtBorrowingPosition(result.borrowing[0])).toBe(
      true,
    )
    expect(isCollateralizedDebtBorrowingPosition(result.borrowing[1])).toBe(
      true,
    )
    expect(isCollateralizedDebtBorrowingPosition(result.borrowing[2])).toBe(
      true,
    )

    if (isCollateralizedDebtLendingPosition(result.lending[0])) {
      expect(result.lending[0].token.address).toBe(
        "0x027ef4670397069d7d5442cb7945b27338692de0d8896bdb15e6400cf5249f94",
      )
      expect(result.lending[0].token.balance).toBe("8000000099")
    }
    if (isCollateralizedDebtBorrowingPosition(result.borrowing[0])) {
      expect(result.borrowing[0].collateralizedPositions).toHaveLength(1)
      expect(result.borrowing[0].debtPositions).toHaveLength(1)
      expect(result.borrowing[0].collateralizedPositions[0].token.address).toBe(
        "0x07809bb63f557736e49ff0ae4a64bd8aa6ea60e3f77f26c520cb92c24e3700d3",
      )
      expect(result.borrowing[0].collateralizedPositions[0].token.balance).toBe(
        "8000000000008124586153",
      )
    }
  })

  it("should return empty arrays for non-collateralized debt positions", async () => {
    const result = await parseCollateralizedDebtPositions(
      concentratedLiquidityPositions,
      mockAccount,
    )

    expect(result.lending).toHaveLength(0)
    expect(result.borrowing).toHaveLength(0)
  })
})
