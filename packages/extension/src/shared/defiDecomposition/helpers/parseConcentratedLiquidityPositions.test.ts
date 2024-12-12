import { isEqualAddress } from "@argent/x-shared"
import { getMockAccount } from "../../../../test/account.mock"
import { collateralizedDebtPositions } from "../__fixtures__/collateralizedDebtPositions"
import { concentratedLiquidityPositions } from "../__fixtures__/concentratedLiquidityPositions"
import { tokens } from "../__fixtures__/tokens"
import { parseConcentratedLiquidityPositions } from "./parseConcentratedLiquidityPositions"

vi.mock("../../../ui/features/accountTokens/tokens.state", () => ({
  useTokenInfo: ({ address }: { address: string }) => {
    return (
      tokens.find((token) => isEqualAddress(token.address, address)) || null
    )
  },
}))

describe("parseConcentratedLiquidityPositions", async () => {
  const mockAccount = getMockAccount({
    address: "0x123",
    networkId: "sepolia-alpha",
  })

  afterEach(async () => {
    vi.clearAllMocks()
  })

  it("should parse concentrated liquidity positions", async () => {
    const result = parseConcentratedLiquidityPositions(
      concentratedLiquidityPositions,
      mockAccount,
      tokens,
    )

    expect(result).toBeDefined()
    expect(result).toHaveLength(2)
    expect(result[0].poolFeePercentage).toBe("0.05")
    expect(result[0].tickSpacingPercentage).toBe("0.1")
    expect(result[0].token0.address).toBe(
      "0x57181b39020af1416747a7d0d2de6ad5a5b721183136585e8774e1425efd5d2",
    )
    expect(result[0].token1.address).toBe(
      "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    )
    expect(result[0].token0.balance).toBe("1128442273967865732")
  })

  it("should return undefined for non-concentrated liquidity positions", async () => {
    const result = parseConcentratedLiquidityPositions(
      collateralizedDebtPositions,
      mockAccount,
      tokens,
    )

    expect(result).toHaveLength(0)
  })
})
